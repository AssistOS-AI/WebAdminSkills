import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { action } from '../skills/webadmin-leads/src/index.mjs';
import { configureDataStore } from '../src/runtime/dataStore.mjs';
import { createWebAdminSandbox } from './helpers.mjs';

test('webadmin-leads lists existing leads', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    const result = await action({ promptText: '{}' });
    assert.match(result, /visitor-42-lead/);
    assert.match(result, /status=new/);
    assert.match(result, /profile=Developer/);
});

test('webadmin-leads reads a lead with full details', async (t) => {
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
            leadId: 'visitor-42-lead',
        }),
    });

    assert.match(result, /Lead: visitor-42-lead/);
    assert.match(result, /Status.*new/);
    assert.match(result, /Profile.*Developer/);
    assert.match(result, /alice@example\.com/);
});

test('webadmin-leads updates lead status', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    const result = await action({
        promptText: JSON.stringify({
            action: 'updateStatus',
            leadId: 'visitor-42-lead',
            newStatus: 'approved',
        }),
    });

    assert.match(result, /Updated lead.*status to: approved/);

    const readResult = await action({
        promptText: JSON.stringify({
            action: 'read',
            leadId: 'visitor-42-lead',
        }),
    });

    assert.match(readResult, /Status.*approved/);
});

test('webadmin-leads rejects invalid status', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    await assert.rejects(
        async () => action({
            promptText: JSON.stringify({
                action: 'updateStatus',
                leadId: 'visitor-42-lead',
                newStatus: 'invalid-status',
            }),
        }),
        /requires valid newStatus/
    );
});
