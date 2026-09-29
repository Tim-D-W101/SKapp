# GlowTrack Privacy Policy

> **Draft for review. Remove this box before publishing.**
>
> This is a starting point written from what the app actually does. It is not
> legal advice. Before it goes live:
>
> - Fill in every `[bracketed]` item.
> - Check each processor's current terms against what is said here. The
>   claims most worth checking are:
>   - Google's Gemini API terms. The statement that photos aren't used for
>     training holds only on a **paid (billing-enabled)** Gemini API project.
>   - How long Google keeps requests.
>   - PostHog's and Sentry's retention periods.
>   - The Supabase region.
> - In PostHog, turn on **Discard client IP data**. In Sentry, turn on
>   **Prevent Storing of IP Addresses**. This policy says both are on.
> - Register an Information Officer with South Africa's Information Regulator.
> - Decide the lawful basis for the photos with your reviewer (see "Why we can
>   use your information").
> - Publish it as a web page (not a PDF), and set its address in
>   `EXPO_PUBLIC_PRIVACY_URL`.

**Effective date:** [date]

GlowTrack is a beauty app. You take a photo of your face, and it gives you
cosmetic estimates of how your skin looks, so you can follow the changes over
weeks. This policy explains what we collect, why, who else handles it, how
long we keep it, and how you stay in control.

We've written it in plain English. Where a legal term can't be avoided, we
explain it.

## Who we are

GlowTrack is operated by [company name], [registration number], of [registered
address], South Africa ("we", "us"). We decide how your information is used,
which makes us the "responsible party" under South Africa's Protection of
Personal Information Act (POPIA) and the "controller" under the EU and UK
General Data Protection Regulation (GDPR).

Our Information Officer is [name]. You can reach them at [privacy email].

## The short version

- Your face photos are stored privately, only so you can compare your scans
  over time.
- Each photo is sent to Google's AI service to produce your estimate. It is
  not used to train any AI model.
- We never sell your photos or your information, never share them with
  advertisers, and never use them for advertising.
- You can download everything, delete your photos, or delete your whole
  account, all from Settings, at any time.
- You don't need to give us your name, and you don't need an email address
  unless you want to keep your progress on a new phone.

## What we collect

**Your face photos.** Each scan uploads one photo, resized to 1024 pixels on
its longest side. The app never saves it to your phone's photo gallery. The app
never asks for your location, so the photos carry none.

**Your cosmetic estimates.** For each scan we store:

- an overall score, and scores for clarity, texture, pores, hydration,
  redness, evenness and firmness;
- a one-line summary and a few short observations about how your skin looks;
- the areas suggested for attention.

**Your answers from getting started.** Your age range (such as 25–34, never
your date of birth), your skin type, up to three skin concerns and your main
goal.

**Your routine.** The suggested morning and evening steps from your latest
scan, and which steps you tick off each day.

**How each photo was taken.** The brightness of the light on your face, how
still the phone was, and which camera was used. This helps read results in
context.

**Your settings.** Your time zone, and your reminder choices (which reminders,
which day and hour).

**Your email address, only if you add one.** Your account starts without one.
If you choose to save your progress with an email, we use it only to sign you
in and to answer you if you contact us.

**Subscription status.** If you subscribe, we know which plan you're on, and
whether it is in a free trial, active or ended. Google Play handles your
payment. We never see your card or bank details.

**How the app is used.** We record app events such as "scan completed" or
"paywall viewed", with scores, counts and choices attached. These events never
include your photos, your email address, or the summary and observations from
your scans. See "Analytics" below.

**Crash reports.** If the app crashes, we receive a technical report. See
"Crash reports" below.

**Kept only on your phone.** A copy of your routine and today's ticks (so the
routine works offline), your reminder settings, and the date you first opened
the app. These never leave your phone except as described above. Reminders are
scheduled on your phone; there is no push notification server.

## What we don't collect

- Your name, postal address or phone number.
- Your location, whether exact or approximate.
- Your contacts, or other photos on your phone.
- Records from any doctor or other professional.
- Advertising identifiers. We don't show ads and don't track you across other
  apps. [Confirm the RevenueCat and PostHog SDKs are used without device
  identifier collection.]

## How we use your photos

1. **To produce your estimate.** When you take a scan, the photo is sent to
   Google's Gemini API, an AI service, which returns the scores and short
   observations. It's used for nothing else.
2. **To let you compare over time.** The photo is stored privately so you can
   see it in your history, line up your next photo with it, and compare scans
   side by side.

Your photos are **not** used to train any AI model, by us or by Google.
[Holds only on a paid Gemini API project; check before publishing.] They are
**not** shared with advertisers, **not** sold, and **not** used for any
purpose other than the two above.

If you choose to make a share image, it includes your face photo only if you
turn that on and confirm it. Once you share an image, it leaves our control.

## Why we can use your information

GDPR and POPIA require a lawful reason, called a "lawful basis", for each use
of personal information.

- **To provide the app you asked for** (scans, estimates, history, routine,
  reminders, your account): it's necessary to provide the service.
- **Your face photos:** we handle them as sensitive information. Before your first photo,
  the app tells you what happens to it, and it only continues when you choose
  "Continue". You can withdraw at any time by deleting your photos or your
  account. [Reviewer: confirm whether consent or another basis is right. Some
  jurisdictions regard face images as biometric data. We don't use the photos
  to identify anyone.]
- **Subscriptions:** necessary to provide what you paid for, and to meet our
  tax and accounting duties.
- **Analytics and crash reports:** our legitimate interest in finding out
  where the app is confusing or broken, and fixing it. You can object (see
  "Your rights").

## Automated estimates

Your scores are produced automatically by an AI model. They are cosmetic
estimates only, and they're affected by lighting, the camera and image
quality. No decision with legal or similarly significant effects on you is
made from them.

## Who else handles your information

We use these service providers ("processors"). Each handles your information
only on our instructions, and only for the purpose listed.

| Provider                | What they do                                                           | What they receive                                                                                  | Where                                |
| ----------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **Supabase**            | Hosts our database and private photo storage, and sends sign-in emails | Everything described under "What we collect" except analytics and crash reports                    | [region, such as the EU (Frankfurt)] |
| **Google** (Gemini API) | Produces the cosmetic estimate from your photo                         | Each scan photo, at the moment of the scan                                                         | [United States and other countries]  |
| **RevenueCat**          | Manages subscriptions                                                  | Your account's random ID, your subscription and its purchase records from Google Play              | United States                        |
| **Google Play**         | Takes payment and manages your subscription                            | Payment is between you and Google, under Google's own privacy policy                               | Worldwide                            |
| **PostHog**             | Analytics                                                              | App events and the account properties listed under "Analytics", linked to your account's random ID | [EU or United States]                |
| **Sentry**              | Crash reporting                                                        | Crash reports, linked to your account's random ID                                                  | [United States or EU]                |

We don't share your information with anyone else, except where the law
requires it (for example, a valid court order), or to protect people's safety
or our legal rights.

### Analytics

We use PostHog to see how the app is used, for example how many people finish
setting up, or where a scan gets stuck. Each event carries only scores, counts
and choices, and is linked to your account's random ID. We also attach a few
facts about your account:

- your skin type and age range;
- how many concerns you chose;
- whether you subscribe;
- how many scans you have done;
- how long ago you installed the app.

We don't record your screen or anything you type. Taps are counted only as
the events themselves, such as pressing the camera's shutter. We've set
PostHog to discard IP addresses.

### Crash reports

Sentry receives a report when the app crashes, in release versions only. A
report contains technical details: the app version, the phone model and
operating system, and where in the code the problem happened. It's linked to
your account's random ID. Before a report leaves your phone, we remove:

- the private parts of web addresses, such as the codes in links to your
  photos;
- storage paths;
- local file paths;
- email addresses.

Reports never include screenshots or your photos, and we've set Sentry not to
store IP addresses.

## International transfers

We operate from South Africa, and some of our providers keep information in
other countries, including the United States and the European Union. Where
information leaves South Africa, the EU or the UK, we rely on safeguards the
law recognises, such as the European Commission's standard contractual
clauses. We also rely on each provider's data processing agreement. [Confirm
the mechanism for each provider.]

## How long we keep it

| Information                         | How long                                                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Face photos                         | Until you delete them (Settings → Your data) or delete your account. Deleted from storage straight away. |
| Scores, history, routine and ticks  | Until you delete your account                                                                            |
| Your answers, settings and email    | Until you delete your account                                                                            |
| Copies sent to Google for analysis  | [As long as Google's Gemini API terms allow, for abuse monitoring; confirm]                              |
| Subscription records                | [As long as tax and accounting law requires, typically 5 years]                                          |
| Analytics events                    | [PostHog retention period, such as 12 months]                                                            |
| Crash reports                       | [Sentry retention period, such as 90 days]                                                               |
| Database backups                    | [Supabase backup period, such as 7 days], after which deleted data is gone from backups too              |
| Information kept only on your phone | Until you delete your account or uninstall the app                                                       |

[Consider a rule for accounts nobody has used in a long time, such as
deleting anonymous accounts after 24 months of no use.]

## How we protect it

- Everything travels between the app and our providers over encrypted
  connections (HTTPS).
- Photos are kept in private storage. Only your account, and our own server
  code, can reach them.
- The app only ever sees a photo through a link that stops working after a
  few minutes.
- Database rules let each account read only its own information.
- The secret keys that reach Google and RevenueCat live only on our servers,
  never in the app.

No system is perfectly secure. If a breach puts your information at risk, we
will tell you and the regulators as the law requires.

## Your rights

Under POPIA and GDPR you have these rights. Most you can use yourself, in the
app, at any time.

| Your right                                        | How to use it                                                                                                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **See your information** (access)                 | Settings → Your data → **Download my data**. You get a file with your account, answers, scans, scores, routines and ticks.                                                           |
| **Take it elsewhere** (portability)               | The same file. It's in JSON, a common format other services can read.                                                                                                                |
| **Delete your photos**                            | Settings → Your data → **Delete all my scan photos**. Your scores and history stay.                                                                                                  |
| **Delete everything** (erasure)                   | Settings → Your data → **Delete my account**. This removes your photos, scores, history, routine, answers, settings and account straight away, and can't be undone.                  |
| **Correct your information**                      | Email [privacy email]. You can also start afresh by deleting your account.                                                                                                           |
| **Object to analytics, or ask us to limit a use** | Email [privacy email], and we'll stop analytics for your account.                                                                                                                    |
| **Withdraw consent for photos**                   | Delete your photos or your account in Settings, and stop taking scans.                                                                                                               |
| **Delete analytics and crash data**               | Deleting your account in the app doesn't reach data already sent to PostHog or Sentry. Email [privacy email] with your account ID (it's in your data download), and we'll delete it. |

We answer requests within [30] days. We may need to confirm the request comes
from you. Using these rights is free.

Deleting your account doesn't cancel a Google Play subscription. Cancel it in
Google Play first: Play Store → your profile → Payments & subscriptions →
Subscriptions.

### Complaints

Please tell us first at [privacy email], and we'll try to put it right. You
can also complain to a regulator:

- **South Africa:** the Information Regulator, inforegulator.org.za
- **United Kingdom:** the Information Commissioner's Office, ico.org.uk
- **European Union:** the data protection authority in your country

## Age limit

GlowTrack is for adults aged 18 and over. It isn't directed at children, and
the app has no age range under 18. If we learn that someone under 18 has used
it, we'll delete their account. If you believe a child has used GlowTrack,
contact us at [privacy email].

## Changes to this policy

When we change this policy, we'll update the effective date above. If a
change matters (for example, a new use of your photos, or a new provider that
receives them), we'll tell you in the app before it takes effect. Where the
law needs your consent to a change, we'll ask for it.

## Contact us

[company name]
[registered address]
Information Officer: [name]
Email: [privacy email]
