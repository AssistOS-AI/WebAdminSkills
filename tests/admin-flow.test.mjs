import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { createWebAdminSandbox } from './helpers.mjs';

function createFakeWebAdminLLM(LLMAgent) {
    return new class FakeWebAdminLLM extends LLMAgent {
        constructor() {
            super({
                name: 'FakeWebAdminLLM',
                invokerStrategy: async () => '',
            });
            this.commands = [];
        }

        async startSOPLangAgentSession(skillsDescription, initialPrompt, options = {}) {
            const commandsRegistry = options?.commandsRegistry;
            const availableCommands = commandsRegistry.listCommands().map((item) => item.name);
            let lastResult = '';

            const runCommand = async (command, args) => {
                let output;
                this.commands.push({ command, args, initialPrompt, availableCommands });
                await commandsRegistry.executeCommand({ command, args }, {
                    success: async (data) => {
                        output = data;
                        return { status: 'success', data };
                    },
                    fail: async (error) => {
                        output = error;
                        return { status: 'fail', error };
                    },
                });
                return output;
            };

            if (availableCommands.length === 1 && availableCommands[0] === 'load-admin-context') {
                lastResult = await runCommand('load-admin-context', [JSON.stringify({})]);
                assert.match(String(lastResult), /^context loaded:\n/);
                assert.doesNotMatch(String(lastResult), /@context_/);
            } else if (String(initialPrompt || '').includes('converted')) {
                const args = {
                    leadId: 'dev-session-lead.md',
                    newStatus: 'converted',
                };
                await runCommand('update-lead', [JSON.stringify(args)]);
                lastResult = 'Am actualizat leadul dev-session-lead.md la statusul converted.';
            } else {
                const args = { interval: 'month' };
                await runCommand('statistics', [JSON.stringify(args)]);
                lastResult = 'Statisticile pe luna curenta sunt pregatite.';
            }

            return {
                getVariables: async () => ({}),
                getLastResult: () => lastResult,
            };
        }
    }();
}

test('admin-flow orchestrates skills with preparation context load', async (t) => {
    let MainAgent;
    let LLMAgent;
    try {
        ({ MainAgent, LLMAgent } = await import('achillesAgentLib'));
    } catch (error) {
        if (error?.code === 'ERR_MODULE_NOT_FOUND' && String(error.message).includes('achillesAgentLib')) {
            t.skip('achillesAgentLib is not installed in webAdmin/node_modules.');
            return;
        }
        throw error;
    }

    const sandbox = await createWebAdminSandbox();
    t.after(async () => sandbox.cleanup());

    const sandboxDataStoreModule = await import(pathToFileURL(path.join(sandbox.agentRoot, 'dataStore.mjs')).href);
    sandboxDataStoreModule.configureDataStore({ agentRoot: sandbox.agentRoot, dataDir: sandbox.dataDir });

    const llmAgent = createFakeWebAdminLLM(LLMAgent);
    const mainAgent = new MainAgent({
        startDir: sandbox.agentRoot,
        disableInternalSkills: true,
    });
    mainAgent.llmAgent = llmAgent;

    const updateResult = await mainAgent.executeSkill('admin-flow', 'Te rog marcheaza dev-session-lead.md ca converted.');
    assert.equal(typeof updateResult?.result, 'string');
    assert.match(updateResult.result, /statusul converted/);

    const updatedLeadContent = await fs.readFile(
        path.join(sandbox.dataDir, 'leads', 'dev-session-lead.md'),
        'utf8'
    );
    assert.match(updatedLeadContent, /- \*\*Status\*\*: converted/);

    const statsResult = await mainAgent.executeSkill('admin-flow', 'Da-mi statisticile pe luna aceasta.');
    assert.equal(typeof statsResult?.result, 'string');
    assert.match(statsResult.result, /Statisticile pe luna curenta/);

});
