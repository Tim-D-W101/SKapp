# analyze-scan

Turns an uploaded scan photo into validated scores and a simple routine, in
one model call. The app uploads the photo,
inserts a `scans` row with status `pending`, then calls this function with the
scan id. The function checks the caller owns the scan and may scan (the free
scan, or an active subscription), sends the photo to Gemini, validates the
reply and writes the result. The app follows the row's status through
Realtime.

```text
pending -> processing -> complete   (scores and routine saved, free scan used up)
                      -> rejected   (photo unusable, free scan kept)
                      -> failed     (anything else, free scan kept)
pending, unchanged: 402 SUBSCRIPTION_REQUIRED (free scan used, no subscription)
```

## Who may scan

Checked before anything costs money, never trusting the app:

1. If `profiles.free_scan_used` is false, the scan is the free one. It is only
   used up by `complete_scan()`, once a scan finishes with scores, so a
   rejected photo or a failure leaves it available.
2. Otherwise the user needs an active `premium` entitlement, which the
   function asks RevenueCat's REST API for, with the user id (the app uses the
   Supabase user id as RevenueCat's app user id).
3. Without one, the answer is `402 SUBSCRIPTION_REQUIRED` and the scan stays
   `pending`, so the app can open the paywall and carry on with the same photo
   after a purchase.
4. An active entitlement is remembered for 5 minutes per user (or until it
   ends, if sooner), so a run of scans doesn't ask RevenueCat every time. Only
   an active answer is remembered: remembering a refusal would keep refusing
   someone for minutes after they subscribe. The memory belongs to one warm
   function instance, so a cold start simply asks again.
5. If RevenueCat can't be reached, or answers with something unexpected, the
   answer is `503 ENTITLEMENT_UNAVAILABLE`: the scan waits rather than running
   for free.

## Files

| File             | What it holds                                                                  |
| ---------------- | ------------------------------------------------------------------------------ |
| `index.ts`       | The HTTP handler: auth, ownership, status changes, saving the result.          |
| `entitlement.ts` | The subscription check against RevenueCat, and its 5-minute memory.            |
| `analysis.ts`    | The model call, Zod validation and the single retry. Shared with calibration.  |
| `routine.ts`     | Puts the routine in order: sunscreen last in the morning, 3 to 5 steps a part. |
| `prompt.ts`      | The system prompt, response schema and `PROMPT_VERSION`. Versioned.            |
| `model.ts`       | The model name, endpoint, settings and prices. Swapping model is one line.     |
| `scoring.ts`     | Clamping and the weighted `overall`.                                           |
| `compliance.ts`  | Rejects replies that use the banned vocabulary listed in `prompt.ts`.          |
| `deno.json`      | Dependency versions (Zod, supabase-js). Nothing here goes into the app bundle. |

## Secrets

The Gemini API key and the RevenueCat secret key live **only** here, as Edge
Function secrets. Never put either in the app, in the root `.env`, or anywhere
with an `EXPO_PUBLIC_` prefix: anything in the app can be pulled out of the
APK.

1. Create a Gemini key in Google AI Studio.
2. In RevenueCat, under **API keys**, create a **secret** API key for API
   version **V1** (it starts `sk_`). This is not the public `goog_` key the app
   uses.
3. Put both in `supabase/functions/.env` (gitignored, like every `.env` file):

   ```text
   GEMINI_API_KEY=your-key-here
   REVENUECAT_SECRET_KEY=sk_your-key-here
   ```

4. Upload it. Using a file keeps the key out of your shell history:

   ```sh
   npx supabase login
   npx supabase secrets set --env-file supabase/functions/.env --project-ref yheevhjamvuxtnqudszk
   ```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to every hosted
Edge Function automatically. If `GEMINI_API_KEY` or `REVENUECAT_SECRET_KEY` is
missing, the function refuses to start, and the error shows in its logs. So
**set `REVENUECAT_SECRET_KEY` before deploying the Phase 10 version**, or every
scan fails, free ones included.

## Deploy

Run the migrations first, in order: paste each into the SQL editor and run it.
Both are safe to run twice.

- `supabase/migrations/0003_scan_pipeline.sql` turns on Realtime for `scans`
  and adds `complete_scan()`, which the function calls.
- `supabase/migrations/0004_routines.sql` (Phase 9) replaces `complete_scan()`
  with a version that also saves the routine, in the same transaction.

**0004 must be in place before this version of the function is deployed.** It
sends a routine to `complete_scan()`, which the 0003 version doesn't accept,
so until 0004 runs every scan would end `failed`.

**Phase 10 adds a secret:** set `REVENUECAT_SECRET_KEY` (see Secrets) before
deploying this version, or the function won't start.

Then deploy the function:

```sh
npx supabase functions deploy analyze-scan --project-ref yheevhjamvuxtnqudszk
```

The Supabase gateway checks the caller's token before the function runs, and
the function checks it again itself. If the gateway check ever rejects valid
tokens (for example after moving the project to the newer JWT signing keys),
redeploy with `--no-verify-jwt`. The function's own check still applies.

## Check the subscription rule

Done when calling the function directly, as a user whose free scan is used and
who has no subscription, returns 402. No app needed:

1. Create a throwaway anonymous user, and note the `access_token` and the
   `user.id` it returns (use the anon key from your `.env`):

   ```sh
   curl -s -X POST "https://yheevhjamvuxtnqudszk.supabase.co/auth/v1/signup" \
     -H "apikey: YOUR_ANON_KEY" -H "Content-Type: application/json" -d '{}'
   ```

2. In the SQL editor, use up its free scan and give it a pending scan. The
   function refuses before it looks at the photo, so no file is needed:

   ```sql
   update public.profiles set free_scan_used = true where id = 'USER_ID';
   insert into public.scans (id, user_id, image_path)
   values (gen_random_uuid(), 'USER_ID', 'USER_ID/check.jpg')
   returning id;
   ```

3. Call the function as that user:

   ```sh
   curl -i -X POST "https://yheevhjamvuxtnqudszk.supabase.co/functions/v1/analyze-scan" \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"scanId":"SCAN_ID_FROM_STEP_2"}'
   ```

   Expect `402` with `{"ok":false,"code":"SUBSCRIPTION_REQUIRED"}`, the scan
   still `pending`, and no Gemini call in the logs.

4. Delete the throwaway user under Authentication > Users. Its rows go with it.

## Check the ownership rule

Done when a request for someone else's scan returns 403. To try it:

1. Take a scan in the app, then copy its `id` from the `scans` table in the
   Supabase Table Editor.
2. Create a second, anonymous user and copy the `access_token` it returns (use
   the anon key from your `.env`):

   ```sh
   curl -s -X POST "https://yheevhjamvuxtnqudszk.supabase.co/auth/v1/signup" \
     -H "apikey: YOUR_ANON_KEY" -H "Content-Type: application/json" -d '{}'
   ```

3. Call the function as that second user:

   ```sh
   curl -i -X POST "https://yheevhjamvuxtnqudszk.supabase.co/functions/v1/analyze-scan" \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer ACCESS_TOKEN_FROM_STEP_2" \
     -H "Content-Type: application/json" \
     -d '{"scanId":"SCAN_ID_FROM_STEP_1"}'
   ```

   Expect `403` with `{"ok":false,"code":"FORBIDDEN"}`. The scan is untouched.

## Error codes

Every error response is `{ "ok": false, "code": "..." }`. The app maps codes to
messages in `src/constants/copy.ts` (`errors.scan`); unknown codes fall back to
the `INTERNAL` message.

| HTTP | Code                      | Meaning                                                      |
| ---- | ------------------------- | ------------------------------------------------------------ |
| 400  | `BAD_REQUEST`             | The body has no valid `scanId`.                              |
| 401  | `UNAUTHORIZED`            | Missing or invalid access token.                             |
| 402  | `SUBSCRIPTION_REQUIRED`   | Free scan used, no active subscription. Stays `pending`.     |
| 403  | `FORBIDDEN`               | The scan belongs to someone else.                            |
| 404  | `NOT_FOUND`               | No scan with that id.                                        |
| 405  | `METHOD_NOT_ALLOWED`      | Anything other than POST.                                    |
| 409  | `ALREADY_PROCESSED`       | The scan isn't `pending`. Makes retries safe to send.        |
| 413  | `IMAGE_TOO_LARGE`         | The photo is over 6 MB.                                      |
| 502  | `MODEL_INVALID_RESPONSE`  | Two replies in a row failed validation.                      |
| 503  | `ENTITLEMENT_UNAVAILABLE` | RevenueCat couldn't confirm a subscription. Stays `pending`. |
| 504  | `MODEL_TIMEOUT`           | Gemini didn't answer within 25 seconds.                      |
| 500  | `INTERNAL`                | Anything else: Gemini errors, database or storage errors.    |

Once a scan is claimed, every failure leaves it `failed` with the code in
`failure_reason`, and a rejected photo leaves it `rejected` with the reason
(for example `too_dark`).

## Logs

Dashboard → Edge Functions → analyze-scan → Logs. One line per scan with its
id, outcome, model, prompt version, attempts, tokens and estimated cost, plus
one line per error. The photo, its base64 data and the model's text are never
logged.

## Changing the model or the prompt

- Model: edit `name` (and the prices) in `model.ts`.
- Prompt: edit `prompt.ts` and bump `PROMPT_VERSION`, following the rules at
  the top of that file.

Either way, rerun the calibration harness before deploying:
`npm run calibrate` (see `scripts/README.md`).

## Type-check locally

```sh
cd supabase/functions/analyze-scan
npx deno check index.ts
npx deno lint
```
