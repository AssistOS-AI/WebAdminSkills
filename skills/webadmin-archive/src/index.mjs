import fs from 'node:fs/promises';
import path from 'node:path';

import {
    getSiteStore,
    getConfiguredDataDir,
} from '../../../src/runtime/dataStore.mjs';
import {
    DATASTORE_TYPES,
    ARCHIVE_FOLDERS,
    getSessionHistoryFileName,
} from '../../../src/constants/datastore.mjs';

function parsePayload(promptText) {
    try {
        const parsed = JSON.parse(String(promptText ?? '{}'));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        throw new Error('webadmin-archive expects promptText to be valid JSON.');
    }
}

function normalizeTarget(value) {
    const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (!raw) return 'all';
    const valid = ['all', 'sessions', 'leads'];
    return valid.includes(raw) ? raw : 'all';
}

export async function action({ promptText }) {
    const payload = parsePayload(promptText);
    const siteId = typeof payload.siteId === 'string' ? payload.siteId.trim() : '';
    if (!siteId) {
        throw new Error('webadmin-archive requires siteId.');
    }

    const target = normalizeTarget(payload.target);
    const sessionIds = Array.isArray(payload.sessionIds) ? payload.sessionIds : [];
    const leadIds = Array.isArray(payload.leadIds) ? payload.leadIds : [];

    const store = getSiteStore(siteId);
    const dataDir = getConfiguredDataDir();
    const siteDataDir = path.join(dataDir, 'sites', siteId);

    const archiveSessionsDir = path.join(siteDataDir, DATASTORE_TYPES.ARCHIVE, ARCHIVE_FOLDERS.SESSIONS);
    const archiveLeadsDir = path.join(siteDataDir, DATASTORE_TYPES.ARCHIVE, ARCHIVE_FOLDERS.LEADS);

    const archived = [];
    const alreadyArchived = [];
    const skipped = [];

    const doArchive = async (sourcePath, destPath, label) => {
        try {
            await fs.access(destPath);
            alreadyArchived.push(label);
            return;
        } catch { /* not in archive yet */ }

        try {
            await fs.access(sourcePath);
        } catch {
            skipped.push(label);
            return;
        }

        await fs.mkdir(path.dirname(destPath), { recursive: true });
        try {
            await fs.rename(sourcePath, destPath);
            archived.push(label);
        } catch (error) {
            if (error.code === 'EXDEV') {
                await fs.copyFile(sourcePath, destPath);
                await fs.unlink(sourcePath);
                archived.push(label);
            } else {
                throw error;
            }
        }
    };

    const archiveSessions = async (ids) => {
        let idsToArchive = ids;
        if (idsToArchive.length === 0 && (target === 'all' || target === 'sessions')) {
            const listing = await store.listFiles(DATASTORE_TYPES.SESSIONS);
            idsToArchive = listing.files;
        }

        for (const sessionId of idsToArchive) {
            const historyFile = `${getSessionHistoryFileName(sessionId)}.md`;
            const sourcePath = path.join(siteDataDir, DATASTORE_TYPES.SESSIONS, historyFile);
            const destPath = path.join(archiveSessionsDir, historyFile);
            await doArchive(sourcePath, destPath, `session:${sessionId}`);
        }
    };

    const archiveLeads = async (ids) => {
        let idsToArchive = ids;
        if (idsToArchive.length === 0 && (target === 'all' || target === 'leads')) {
            const listing = await store.listFiles(DATASTORE_TYPES.LEADS);
            idsToArchive = listing.files;
        }

        for (const leadId of idsToArchive) {
            const leadFile = `${leadId}.md`;
            const sourcePath = path.join(siteDataDir, DATASTORE_TYPES.LEADS, leadFile);
            const destPath = path.join(archiveLeadsDir, leadFile);
            await doArchive(sourcePath, destPath, `lead:${leadId}`);
        }
    };

    if (target === 'all' || target === 'sessions') {
        await archiveSessions(sessionIds);
    }
    if (target === 'all' || target === 'leads') {
        await archiveLeads(leadIds);
    }

    const lines = [`Archive report (${siteId}):`];
    if (archived.length > 0) {
        lines.push(`Archived: ${archived.join(', ')}`);
    }
    if (alreadyArchived.length > 0) {
        lines.push(`Already archived: ${alreadyArchived.join(', ')}`);
    }
    if (skipped.length > 0) {
        lines.push(`Skipped (not found): ${skipped.join(', ')}`);
    }
    if (archived.length === 0 && alreadyArchived.length === 0 && skipped.length === 0) {
        lines.push('Nothing to archive.');
    }

    return lines.join('\n');
}
