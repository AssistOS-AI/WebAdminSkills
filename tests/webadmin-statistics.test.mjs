import test from 'node:test';
import assert from 'node:assert/strict';

import { action } from '../skills/webadmin-statistics/src/index.mjs';
import { configureDataStore } from '../src/runtime/dataStore.mjs';
import { createWebAdminSandbox } from './helpers.mjs';

test('webadmin-statistics produces metrics report', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    const result = await action({
        promptText: JSON.stringify({ interval: 'month' }),
    });

    assert.match(result, /Statistics \(month\)/);
    assert.match(result, /Total Unique Visitors:/);
    assert.match(result, /Total Sessions:/);
    assert.match(result, /Total Leads:/);
    assert.match(result, /Conversion Rate:/);
});

test('webadmin-statistics rejects invalid interval', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    await assert.rejects(
        async () => action({
            promptText: JSON.stringify({ interval: 'year' }),
        }),
        /requires interval/
    );
});
