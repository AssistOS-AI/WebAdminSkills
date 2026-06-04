import fs from 'node:fs/promises';
import path from 'node:path';

import { MarkdownDataStore } from 'achillesAgentLib';

let configuredDataRoot = null;
let configuredDataDir = null;
let dataStoreInstance = null;

function isConfigured() {
    return dataStoreInstance !== null;
}

function autoConfigure() {
    if (isConfigured()) {
        return;
    }
    let dataDir = process.env.DATA_DIR || process.env.dataDir || '';
    if (!dataDir) {
        for (const arg of process.argv) {
            if (arg.startsWith('--dataDir=') || arg.startsWith('--data-dir=')) {
                dataDir = arg.split('=')[1] || '';
                break;
            }
        }
    }
    if (!dataDir) {
        dataDir = path.join(process.cwd(), 'data');
    }
    configureDataStore({ dataDir });
}

export function resolveDataDir(agentRoot, explicitDataDir = null) {
    return explicitDataDir
        ? path.resolve(explicitDataDir)
        : path.join(process.cwd(), 'data');
}

export function normalizeSiteId(value) {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) {
        throw new Error('siteId is required.');
    }
    const normalized = raw.replace(/[^A-Za-z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '');
    if (!normalized) {
        throw new Error('siteId must be a valid site identifier.');
    }
    return normalized;
}

export function resolveSiteDataDir(dataRoot, siteId) {
    return path.join(path.resolve(dataRoot), 'sites', normalizeSiteId(siteId));
}

export function configureDataStore({ agentRoot = null, dataDir = null } = {}) {
    const resolvedDataRoot = resolveDataDir(agentRoot, dataDir);
    const resolvedDataDir = path.resolve(resolvedDataRoot);

    configuredDataRoot = resolvedDataRoot;
    configuredDataDir = resolvedDataDir;
    dataStoreInstance = new MarkdownDataStore({ dataDir: resolvedDataDir });
    return dataStoreInstance;
}

export function getSiteStore(siteId) {
    autoConfigure();
    const normalizedSiteId = normalizeSiteId(siteId);
    const siteDataDir = path.join(configuredDataDir, 'sites', normalizedSiteId);
    return new MarkdownDataStore({ dataDir: siteDataDir });
}

export async function listSites() {
    autoConfigure();
    const sitesDir = path.join(configuredDataDir, 'sites');
    try {
        const entries = await fs.readdir(sitesDir, { withFileTypes: true });
        return entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort();
    } catch {
        return [];
    }
}

export function getConfiguredDataRoot() {
    autoConfigure();
    if (!configuredDataRoot) {
        throw new Error('Datastore is not configured. Call configureDataStore first.');
    }
    return configuredDataRoot;
}

export function getConfiguredDataDir() {
    autoConfigure();
    if (!configuredDataDir) {
        throw new Error('Datastore is not configured. Call configureDataStore first.');
    }
    return configuredDataDir;
}

export function getDataStore() {
    autoConfigure();
    if (!dataStoreInstance) {
        throw new Error('Datastore is not configured. Call configureDataStore first.');
    }
    return dataStoreInstance;
}
