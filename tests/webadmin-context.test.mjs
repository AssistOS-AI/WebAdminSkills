import test from 'node:test';
import assert from 'node:assert/strict';

import { action } from '../skills/webadmin-context/src/index.mjs';
import { configureDataStore } from '../src/runtime/dataStore.mjs';
import { createWebAdminSandbox } from './helpers.mjs';

test('webadmin-context loads site-scoped admin context', async (t) => {
    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    configureDataStore({
        agentRoot: sandbox.agentRoot,
        dataDir: sandbox.dataDir,
        siteId: sandbox.siteId,
    });

    const result = await action({ promptText: '{}' });

    assert.match(result, /site_id: demo-site/);
    assert.match(result, /reference_date:/);
    assert.match(result, /known_lead_ids:.*visitor-42-lead/);
    assert.match(result, /known_session_ids:.*visitor-42-history/);
    assert.match(result, /known_profile_templates:.*Developer/);
    assert.match(result, /owner_info_snapshot/);
    assert.match(result, /policy_snapshot/);
});
