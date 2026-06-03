import test from 'node:test';
import assert from 'node:assert/strict';

import { action } from '../skills/webadmin-sessions/src/index.mjs';
import { configureDataStore } from '../src/runtime/dataStore.mjs';
import { createWebAdminSandbox } from './helpers.mjs';

test('webadmin-sessions lists existing sessions', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    const result = await action({ promptText: '{}' });
    assert.match(result, /visitor-42-history/);
});

test('webadmin-sessions reads a session with profile and history', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    const result = await action({
        promptText: JSON.stringify({
            action: 'read',
            sessionId: 'visitor-42',
        }),
    });

    assert.match(result, /Session: visitor-42/);
    assert.match(result, /Profile Details/);
    assert.match(result, /Evaluating an API integration/);
    assert.match(result, /History/);
    assert.match(result, /Buna, vreau sa integrez/);
});

test('webadmin-sessions returns not found for missing session', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    const result = await action({
        promptText: JSON.stringify({
            action: 'read',
            sessionId: 'nonexistent-session',
        }),
    });

    assert.match(result, /Session not found/);
});
