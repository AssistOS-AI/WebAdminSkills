import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

import { configureDataStore, resolveDataDir } from '../src/runtime/dataStore.mjs';
import { createWebAdminSandbox } from './helpers.mjs';

test('default data directory resolves to current working directory data folder', async (t) => {
    const resolved = resolveDataDir(null, null);
    assert.equal(resolved, path.join(process.cwd(), 'data'));
});

test('explicit data directory override wins', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    const resolved = resolveDataDir(sandbox.agentRoot, '/custom/data');
    assert.equal(resolved, '/custom/data');
});

test('all cskills handle invalid JSON gracefully', async (t) => {
    const { action: contextAction } = await import('../skills/webadmin-context/src/index.mjs');
    const { action: profilesAction } = await import('../skills/webadmin-profiles/src/index.mjs');
    const { action: leadsAction } = await import('../skills/webadmin-leads/src/index.mjs');
    const { action: sessionsAction } = await import('../skills/webadmin-sessions/src/index.mjs');
    const { action: statisticsAction } = await import('../skills/webadmin-statistics/src/index.mjs');
    const { action: archiveAction } = await import('../skills/webadmin-archive/src/index.mjs');
    const { action: ownerInfoAction } = await import('../skills/webadmin-ownerInfo/src/index.mjs');
    const { action: siteConfigAction } = await import('../skills/webadmin-site-config/src/index.mjs');
    const { action: kuSearchAction } = await import('../skills/webadmin-ku-search/src/index.mjs');
    const { action: kuStoreAction } = await import('../skills/webadmin-ku-store/src/index.mjs');

    const actions = [
        profilesAction,
        leadsAction,
        sessionsAction,
        statisticsAction,
        archiveAction,
        ownerInfoAction,
        siteConfigAction,
        kuSearchAction,
        kuStoreAction,
    ];

    for (const actionFn of actions) {
        await assert.rejects(
            async () => actionFn({ promptText: 'not-json' }),
            /requires siteId|requires interval|requires a valid target|requires a query|requires action|requires kuName/
        );
    }
});
