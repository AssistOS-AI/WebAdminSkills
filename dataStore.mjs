import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { MarkdownDataStore } from 'achillesAgentLib';

let configuredDataDir = null;
let dataStoreInstance = null;

function getDefaultAgentRoot() {
    const sharedRuntimeDir = path.dirname(fileURLToPath(import.meta.url));
    return path.resolve(sharedRuntimeDir, '..', '..', '..');
}

function firstExistingDir(candidates) {
    for (const candidate of candidates) {
        if (!candidate) continue;
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
    return null;
}

export function resolveDataDir(agentRoot, explicitDataDir = null) {
    if (explicitDataDir) {
        return path.resolve(explicitDataDir);
    }

    const envDataDir = process.env.WEBADMIN_DATA_DIR || process.env.PLOINKY_DATA_DIR || '';
    if (envDataDir.trim()) {
        return path.resolve(envDataDir.trim());
    }

    const resolvedAgentRoot = path.resolve(agentRoot || getDefaultAgentRoot());
    const siblingDataDir = path.resolve(resolvedAgentRoot, '..', 'data');
    const localDataDir = path.resolve(resolvedAgentRoot, 'data');
    return firstExistingDir([siblingDataDir, localDataDir]) || siblingDataDir;
}

export function configureDataStore({ agentRoot, dataDir = null } = {}) {
    const resolvedAgentRoot = path.resolve(agentRoot || getDefaultAgentRoot());
    const resolvedDataDir = resolveDataDir(resolvedAgentRoot, dataDir);
    configuredDataDir = resolvedDataDir;
    dataStoreInstance = new MarkdownDataStore({ dataDir: resolvedDataDir });
    return dataStoreInstance;
}

export function ensureDataStoreConfigured(options = {}) {
    if (!dataStoreInstance) {
        configureDataStore(options);
    }
    return dataStoreInstance;
}

export function getConfiguredDataDir() {
    if (!configuredDataDir) {
        ensureDataStoreConfigured();
    }
    return configuredDataDir;
}

export function getDataStore() {
    if (!dataStoreInstance) {
        ensureDataStoreConfigured();
    }
    return dataStoreInstance;
}
