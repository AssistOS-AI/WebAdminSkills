import test from 'node:test';
import assert from 'node:assert/strict';

import { action } from '../skills/webadmin-statistics/src/index.mjs';
import { configureDataStore } from '../src/runtime/dataStore.mjs';
import { createWebAdminSandbox } from './helpers.mjs';

test('webadmin-statistics produces metrics report for a site', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
    });

    const result = await action({
        promptText: JSON.stringify({
            siteId: sandbox.siteId,
            interval: 'month',
        }),
    });

    assert.match(result, /Statistics \(month\)/);
    assert.match(result, /Site: demo-site/);
    assert.match(result, /Total Unique Visitors:/);
    assert.match(result, /Total Sessions:/);
    assert.match(result, /Total Leads:/);
    assert.match(result, /Conversion Rate:/);
});

test('webadmin-statistics produces cross-site report when no siteId', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
    });

    const result = await action({
        promptText: JSON.stringify({ interval: 'month' }),
    });

    assert.match(result, /Statistics \(month\)/);
    assert.match(result, /Sites: 1/);
    assert.match(result, /Per-Site Breakdown/);
});

test('webadmin-statistics rejects invalid interval', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
    });

    await assert.rejects(
        async () => action({
            promptText: JSON.stringify({ interval: 'year' }),
        }),
        /requires interval/
    );
});
