import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const SEED_DATA_DIR = path.join(FIXTURES_DIR, 'seed-data', 'sites', 'demo-site');
const SOURCE_SKILLS_DIR = path.resolve(FIXTURES_DIR, '..', '..', 'skills');
const SOURCE_SRC_DIR = path.resolve(FIXTURES_DIR, '..', '..', 'src');
const SOURCE_ACHILLES_DIR = path.resolve(FIXTURES_DIR, '..', '..', 'node_modules', 'achillesAgentLib');

export async function createWebAdminSandbox() {
    const sandboxRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'webadmin-sandbox-'));
    const agentRoot = path.join(sandboxRoot, 'agent-root');
    const dataDir = path.join(agentRoot, 'data');
    const siteDataDir = path.join(dataDir, 'sites', 'demo-site');
    const skillsDir = path.join(agentRoot, 'skills');
    const srcDir = path.join(agentRoot, 'src');
    const nodeModulesDir = path.join(agentRoot, 'node_modules');

    await fs.mkdir(siteDataDir, { recursive: true });
    await fs.cp(SEED_DATA_DIR, siteDataDir, { recursive: true });
    await fs.cp(SOURCE_SKILLS_DIR, skillsDir, { recursive: true });
    await fs.cp(SOURCE_SRC_DIR, srcDir, { recursive: true });
    await fs.mkdir(nodeModulesDir, { recursive: true });

    try {
        await fs.cp(SOURCE_ACHILLES_DIR, path.join(nodeModulesDir, 'achillesAgentLib'), { recursive: true });
    } catch {
        // achillesAgentLib not available, tests that need it will skip.
    }

    return {
        sandboxRoot,
        agentRoot,
        dataDir,
        siteDataDir,
        siteId: 'demo-site',
        async cleanup() {
            await fs.rm(sandboxRoot, { recursive: true, force: true });
        },
    };
}
