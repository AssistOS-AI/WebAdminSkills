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
        siteId: sandbox.siteId,
    });

    const result = await action({
        promptText: JSON.stringify({ target: 'policy' }),
    });

    assert.match(result, /policy config/);
    assert.match(result, /Consent Rule/);
});

test('webadmin-site-config updates policy fields', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    const result = await action({
        promptText: JSON.stringify({
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
        siteId: sandbox.siteId,
    });

    await assert.rejects(
        async () => action({
            promptText: JSON.stringify({ target: 'invalid' }),
        }),
        /requires a valid target/
    );
});
