import test from 'node:test';
import assert from 'node:assert/strict';

import { action } from '../skills/webadmin-context/src/index.mjs';
import { configureDataStore } from '../src/runtime/dataStore.mjs';
import { createWebAdminSandbox } from './helpers.mjs';

test('webadmin-context lists all sites when no siteId specified', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
    });

    const result = await action({ promptText: '{}' });

    assert.match(result, /Sites \(1\):/);
    assert.match(result, /demo-site:/);
    assert.match(result, /sessions=/);
    assert.match(result, /leads=/);
    assert.match(result, /profiles=/);
});

test('webadmin-context shows details for a specific site when siteId specified', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
    });

    const result = await action({
        promptText: JSON.stringify({ siteId: 'demo-site' }),
    });

    assert.match(result, /Site: demo-site/);
    assert.match(result, /Sessions:/);
    assert.match(result, /Leads:/);
    assert.match(result, /Profiles:/);
    assert.match(result, /Owner:/);
});
