import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

import { action } from '../skills/webadmin-ku-search/src/index.mjs';
import { configureDataStore } from '../src/runtime/dataStore.mjs';
import { createWebAdminSandbox } from './helpers.mjs';

test('webadmin-ku-search returns not initialized when no AKU exists', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    const result = await action({
        promptText: JSON.stringify({ query: 'test' }),
    });

    assert.match(result, /AKU not initialized/);
});

test('webadmin-ku-search rejects empty query', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    await assert.rejects(
        async () => action({
            promptText: JSON.stringify({ query: '' }),
        }),
        /requires a query/
    );
});
