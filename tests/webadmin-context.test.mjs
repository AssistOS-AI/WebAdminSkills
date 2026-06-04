import test from 'node:test';
import assert from 'node:assert/strict';

import { action } from '../skills/webadmin-context/src/index.mjs';
import { configureDataStore } from '../src/runtime/dataStore.mjs';
import { createWebAdminSandbox } from './helpers.mjs';

test('webadmin-context lists all sites with session IDs', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
    });

    const result = await action();

    assert.match(result, /SiteIDs \(1\):/);
    assert.match(result, /demo-site/);
    assert.match(result, /Sessions:.*visitor-42/);
    assert.doesNotMatch(result, /-history/);
    assert.match(result, /Leads:/);
    assert.match(result, /Profiles:/);
    assert.match(result, /Owner:/);
});
