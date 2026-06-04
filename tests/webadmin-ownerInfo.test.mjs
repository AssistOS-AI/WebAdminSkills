import test from 'node:test';
import assert from 'node:assert/strict';

import { action } from '../skills/webadmin-ownerInfo/src/index.mjs';
import { configureDataStore } from '../src/runtime/dataStore.mjs';
import { createWebAdminSandbox } from './helpers.mjs';

test('webadmin-ownerInfo reads owner contact info', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
    });

    const result = await action({
        promptText: JSON.stringify({ siteId: sandbox.siteId }),
    });
    assert.match(result, /admin@example\.com/);
    assert.match(result, /\+1-555-0100/);
});

test('webadmin-ownerInfo updates individual fields', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
    });

    const result = await action({
        promptText: JSON.stringify({
            siteId: sandbox.siteId,
            fields: {
                Email: 'newadmin@example.com',
                Phone: '+1-555-9999',
            },
        }),
    });

    assert.match(result, /Updated owner contact fields.*Email.*Phone/);

    const readResult = await action({
        promptText: JSON.stringify({ siteId: sandbox.siteId }),
    });
    assert.match(readResult, /newadmin@example\.com/);
    assert.match(readResult, /\+1-555-9999/);
});

test('webadmin-ownerInfo requires siteId', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
    });

    await assert.rejects(
        () => action({ promptText: '{}' }),
        /requires siteId/
    );
});
