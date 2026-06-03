import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { action } from '../skills/webadmin-profiles/src/index.mjs';
import { configureDataStore } from '../src/runtime/dataStore.mjs';
import { createWebAdminSandbox } from './helpers.mjs';

test('webadmin-profiles lists existing profiles', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    const result = await action({ promptText: '{}' });
    assert.match(result, /Developer/);
    assert.match(result, /EnterpriseClient/);
});

test('webadmin-profiles creates and updates a profile with mandatory conditions', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    const createResult = await action({
        promptText: JSON.stringify({
            profileName: 'Investor',
            characteristics: ['Capital allocator', 'Portfolio manager'],
            interests: ['Equity opportunities', 'Strategic partnerships'],
            qualifyingCriteria: ['Investment thesis alignment', 'Minimum deal size'],
            mandatoryConditions: ['Due diligence completed'],
        }),
    });

    assert.match(createResult, /Created.*Investor/);
    assert.match(createResult, /Characteristics: 2 items/);
    assert.match(createResult, /Mandatory conditions: 1 items/);

    const displayResult = await action({
        promptText: JSON.stringify({
            action: 'display',
            profileName: 'Investor',
        }),
    });

    assert.match(displayResult, /Investor/);
    assert.match(displayResult, /Capital allocator/);
    assert.match(displayResult, /Due diligence completed/);
});
