import fs from 'node:fs';
import path from 'node:path';

import { MarkdownDataStore } from 'achillesAgentLib';

let configuredDataDir = null;
let dataStoreInstance = null;

function getDefaultRuntimeDataDir() {
    return path.resolve(process.cwd(), 'data');
}

export function resolveDataDir(_agentRoot, explicitDataDir = null) {
    if (explicitDataDir) {
        return path.resolve(explicitDataDir);
    }

    return getDefaultRuntimeDataDir();
}

export function configureDataStore({ agentRoot = null, dataDir = null } = {}) {
    const resolvedDataDir = resolveDataDir(agentRoot, dataDir);
    fs.mkdirSync(resolvedDataDir, { recursive: true });
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
