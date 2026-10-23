import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { BANNED_TERMS } from '../../supabase/functions/analyze-scan/prompt.ts';
import { copy } from '../constants/copy.ts';
import type { EntitlementStatus } from './purchases.ts';

import {
  entitlementWithPreview,
  isPremiumPreviewAvailable,
  PREMIUM_PREVIEW_FLAG,
  PRODUCTION_CHANNEL,
} from './premiumPreview.ts';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

/** A file from the repository, by its path from the root. */
function readRepoFile(path: string): string {
  return readFileSync(join(ROOT, path), 'utf8');
}

/** Every .ts and .tsx file of the app under a directory (not the tests), by its path from the root. */
function sourceFiles(dir: string): string[] {
  return readdirSync(join(ROOT, dir), { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && /(?<!\.test)\.tsx?$/.test(entry.name))
    .map((entry) => relative(ROOT, join(entry.parentPath, entry.name)));
}

/** Channels a build can have: none (development), the preview build's, and odd ones. */
const NON_PRODUCTION_CHANNELS = [null, 'preview', 'development', 'main'];
const PRODUCTION_CHANNELS = [PRODUCTION_CHANNEL, 'Production', ' production ', 'PRODUCTION'];

describe('isPremiumPreviewAvailable', () => {
  it('is off when the flag is unset, whatever the build', () => {
    for (const channel of [...NON_PRODUCTION_CHANNELS, ...PRODUCTION_CHANNELS]) {
      assert.equal(isPremiumPreviewAvailable({ flag: undefined, channel }), false, `${channel}`);
    }
  });

  it('is off for any value but exactly "true"', () => {
    for (const flag of ['', 'false', '0', '1', 'yes', 'on', 'TRUE', 'True', ' true', 'true ']) {
      for (const channel of NON_PRODUCTION_CHANNELS) {
        assert.equal(isPremiumPreviewAvailable({ flag, channel }), false, `"${flag}" ${channel}`);
      }
    }
  });

  it('is off in a production build, even with the flag set', () => {
    for (const channel of PRODUCTION_CHANNELS) {
      assert.equal(isPremiumPreviewAvailable({ flag: 'true', channel }), false, `"${channel}"`);
    }
  });

  it('is offered with the flag in a preview or development build', () => {
    assert.equal(isPremiumPreviewAvailable({ flag: 'true', channel: 'preview' }), true);
    assert.equal(isPremiumPreviewAvailable({ flag: 'true', channel: null }), true);
  });
});

describe('entitlementWithPreview', () => {
  const statuses: EntitlementStatus[] = ['unknown', 'active', 'lapsed', 'none'];

  it("passes RevenueCat's answer through while the preview is off", () => {
    for (const status of statuses) assert.equal(entitlementWithPreview(status, false), status);
  });

  it('counts as active while the preview is on', () => {
    for (const status of statuses) assert.equal(entitlementWithPreview(status, true), 'active');
  });
});

describe('where the switch can appear', () => {
  const reader = 'src/stores/usePremiumPreviewStore.ts';

  it('reads the flag in one place only, through the check above', () => {
    const readers = [...sourceFiles('src'), ...sourceFiles('app')].filter((path) =>
      readRepoFile(path).includes(`process.env.${PREMIUM_PREVIEW_FLAG}`),
    );
    assert.deepEqual(readers, [reader]);

    const store = readRepoFile(reader).replace(/\s+/g, ' ');
    assert.ok(
      store.includes(
        `isPremiumPreviewAvailable({ flag: process.env.${PREMIUM_PREVIEW_FLAG}, channel: Updates.channel, })`,
      ),
      'PREMIUM_PREVIEW_AVAILABLE must come from isPremiumPreviewAvailable',
    );
    // The store does nothing in a build that doesn't offer the switch.
    assert.equal(store.match(/if \(!PREMIUM_PREVIEW_AVAILABLE\) return;/g)?.length, 2);
  });

  it('shows the Testing section only behind PREMIUM_PREVIEW_AVAILABLE', () => {
    const users = [...sourceFiles('src'), ...sourceFiles('app')].filter((path) =>
      /<TestingSection\b/.test(readRepoFile(path)),
    );
    assert.deepEqual(users, ['src/components/settings/SettingsScreen.tsx']);
    assert.match(
      readRepoFile(users[0]),
      /\{PREMIUM_PREVIEW_AVAILABLE \? <TestingSection \/> : null\}/,
    );
  });

  it('is never set by the production build profile or app config', () => {
    const eas: unknown = JSON.parse(readRepoFile('eas.json'));
    const production = (eas as { build: { production: { env?: Record<string, string> } } }).build
      .production;
    assert.equal(production.env?.[PREMIUM_PREVIEW_FLAG], undefined);
    assert.ok(!readRepoFile('app.json').includes(PREMIUM_PREVIEW_FLAG), 'app.json');
    assert.doesNotMatch(
      readRepoFile('.env.example'),
      new RegExp(`^${PREMIUM_PREVIEW_FLAG}=\\s*true`, 'm'),
      '.env.example',
    );
  });
});

describe('preview copy', () => {
  const strings = [
    ...Object.values(copy.settings.testing),
    copy.scan.subscriptionNeeded.previewNote,
  ];

  it('says scans still follow the server', () => {
    assert.match(copy.settings.testing.serverNote, /server/);
    assert.match(copy.settings.testing.serverNote, /free-scan limit/);
    assert.match(copy.scan.subscriptionNeeded.previewNote, /real subscription/);
    assert.match(copy.settings.testing.premiumPreviewHint, /not a subscription/);
  });

  it('stays within the cosmetic vocabulary', () => {
    for (const text of strings) {
      for (const term of BANNED_TERMS) {
        assert.doesNotMatch(text, new RegExp(`\\b${term}`, 'i'), `"${term}" in "${text}"`);
      }
    }
  });
});
