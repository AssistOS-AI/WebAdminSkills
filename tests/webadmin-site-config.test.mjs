import test from 'node:test';
import assert from 'node:assert/strict';

import { action } from '../skills/webadmin-site-config/src/index.mjs';
import { configureDataStore } from '../src/runtime/dataStore.mjs';
import { createWebAdminSandbox } from './helpers.mjs';

test('webadmin-site-config reads policy config', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
    });

    const result = await action({
        promptText: JSON.stringify({
            siteId: sandbox.siteId,
            target: 'policy',
        }),
    });

    assert.match(result, /policy config/);
    assert.match(result, /Retention/);
});

test('webadmin-site-config updates policy fields', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
    });

    const result = await action({
        promptText: JSON.stringify({
            siteId: sandbox.siteId,
            target: 'policy',
            fields: {
                'Retention': 'Sessions retained 60 days.',
            },
        }),
    });

    assert.match(result, /Updated policy config fields.*Retention/);
});

test('webadmin-site-config rejects invalid target', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
    });

    await assert.rejects(
        async () => action({
            promptText: JSON.stringify({
                siteId: sandbox.siteId,
                target: 'invalid',
            }),
        }),
        /requires a valid target/
    );
});

test('webadmin-site-config requires siteId', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
    });

    await assert.rejects(
        () => action({ promptText: JSON.stringify({ target: 'policy' }) }),
        /requires siteId/
    );
});
