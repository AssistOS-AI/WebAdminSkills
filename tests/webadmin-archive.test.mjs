import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { action } from '../skills/webadmin-archive/src/index.mjs';
import { configureDataStore } from '../src/runtime/dataStore.mjs';
import { createWebAdminSandbox } from './helpers.mjs';

test('webadmin-archive moves session and lead files to archive', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    const result = await action({
        promptText: JSON.stringify({
            sessionIds: ['visitor-42'],
            target: 'sessions',
        }),
    });

    assert.match(result, /Archived.*session:visitor-42/);

    const archiveDir = path.join(sandbox.siteDataDir, 'archive', 'sessions');
    const archivedFile = path.join(archiveDir, 'visitor-42-history.md');
    const stat = await fs.stat(archivedFile);
    assert.ok(stat.isFile());
});

test('webadmin-archive skips missing files', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    const result = await action({
        promptText: JSON.stringify({
            sessionIds: ['nonexistent-session'],
            target: 'sessions',
        }),
    });

    assert.match(result, /Skipped.*nonexistent-session/);
});

test('webadmin-archive detects already-archived files', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    // First archive.
    await action({
        promptText: JSON.stringify({
            sessionIds: ['visitor-42'],
            target: 'sessions',
        }),
    });

    // Second archive attempt.
    const result = await action({
        promptText: JSON.stringify({
            sessionIds: ['visitor-42'],
            target: 'sessions',
        }),
    });

    assert.match(result, /Already archived.*session:visitor-42/);
});
