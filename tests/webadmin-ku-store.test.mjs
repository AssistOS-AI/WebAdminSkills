import test from 'node:test';
import assert from 'node:assert/strict';

import { action } from '../skills/webadmin-ku-store/src/index.mjs';
import { configureDataStore } from '../src/runtime/dataStore.mjs';
import { createWebAdminSandbox } from './helpers.mjs';

test('webadmin-ku-store initializes a KU', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    const result = await action({
        promptText: JSON.stringify({
            action: 'init',
            kuType: 'site-positioning',
            title: 'Demo Site Positioning',
            summary: 'Consolidated description of the demo site.',
            reusableFindings: ['Site targets developers', 'API integration is primary offering'],
        }),
    });

    assert.match(result, /Created KU:/);
    assert.match(result, /site-positioning/);
});

test('webadmin-ku-store rejects invalid action', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    await assert.rejects(
        async () => action({
            promptText: JSON.stringify({ action: 'invalid' }),
        }),
        /requires action/
    );
});
