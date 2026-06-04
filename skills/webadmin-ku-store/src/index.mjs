import { AgenticKnowledgeUnits } from 'achillesAgentLib';
import path from 'node:path';

import {
    configureDataStore,
    getConfiguredDataDir,
} from '../../../src/runtime/dataStore.mjs';

function parsePayload(promptText) {
    const raw = String(promptText ?? '').trim();
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function normalizeAction(value) {
    const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
    const valid = ['init', 'update', 'fork', 'archive', 'discard'];
    if (!valid.includes(raw)) {
        throw new Error('webadmin-ku-store requires action: init, update, fork, archive, or discard.');
    }
    return raw;
}

function resolveAkuRoot(dataDir) {
    return path.join(path.resolve(dataDir), '.aku');
}

export async function action({ promptText }) {
    const payload = parsePayload(promptText);
    const actionType = normalizeAction(payload.action);
    const dataDir = getConfiguredDataDir();
    const akuRoot = resolveAkuRoot(dataDir);

    const aku = new AgenticKnowledgeUnits({
        rootDir: akuRoot,
        actor: 'webadmin',
        contextBudgetChars: 8000,
    });

    if (actionType === 'init') {
        const kuType = typeof payload.kuType === 'string' ? payload.kuType.trim() : 'general';
        const title = typeof payload.title === 'string' ? payload.title.trim() : '';
        const summary = typeof payload.summary === 'string' ? payload.summary.trim() : '';

        try {
            await aku.loadAKU();
        } catch {
            await aku.initAKU({ description: `AKU for site ${getConfiguredDataDir()}` });
        }

        const ku = await aku.initKU({
            kuType,
            title,
            summary,
            reusableFindings: Array.isArray(payload.reusableFindings) ? payload.reusableFindings : [],
        });

        return `Created KU: ${ku.ku_id} (type: ${kuType}, title: ${title || '(none)'})`;
    }

    const kuId = typeof payload.kuId === 'string' ? payload.kuId.trim() : '';
    if (!kuId) {
        throw new Error('webadmin-ku-store requires kuId for update/fork/archive/discard.');
    }

    try {
        await aku.loadAKU();
    } catch {
        throw new Error('AKU not initialized for this site. Run init first.');
    }

    if (actionType === 'update') {
        await aku.updateKU(kuId, {
            title: payload.title,
            summary: payload.summary,
            reusableFindings: Array.isArray(payload.reusableFindings) ? payload.reusableFindings : undefined,
        });
        return `Updated KU: ${kuId}.`;
    }

    if (actionType === 'fork') {
        const forked = await aku.forkKU(kuId, {
            title: payload.title,
            summary: payload.summary,
        });
        return `Forked KU ${kuId} to: ${forked.ku_id}.`;
    }

    if (actionType === 'archive') {
        await ku.archiveKU(kuId, 'archived by admin');
        return `Archived KU: ${kuId}.`;
    }

    if (actionType === 'discard') {
        await ku.discardKU(kuId, 'discarded by admin');
        return `Discarded KU: ${kuId}.`;
    }
}
