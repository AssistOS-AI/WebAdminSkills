import { AgenticKnowledgeUnits } from 'achillesAgentLib';
import path from 'node:path';

import {
    configureDataStore,
    getConfiguredDataDir,
} from '../../../src/runtime/dataStore.mjs';

function parsePayload(promptText) {
    try {
        const parsed = JSON.parse(String(promptText ?? '{}'));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        throw new Error('webadmin-ku-search expects promptText to be valid JSON.');
    }
}

function resolveAkuRoot(dataDir) {
    return path.join(path.resolve(dataDir), '.aku');
}

export async function action({ promptText }) {
    const payload = parsePayload(promptText);
    const query = typeof payload.query === 'string' ? payload.query.trim() : '';
    if (!query) {
        throw new Error('webadmin-ku-search requires a query.');
    }

    const dataDir = getConfiguredDataDir();
    const akuRoot = resolveAkuRoot(dataDir);

    const aku = new AgenticKnowledgeUnits({
        rootDir: akuRoot,
        actor: 'webadmin',
        contextBudgetChars: 8000,
    });

    try {
        await aku.loadAKU();
    } catch {
        return 'AKU not initialized for this site. No knowledge units to search.';
    }

    const recordType = typeof payload.recordType === 'string' ? payload.recordType.trim() : undefined;
    const limit = typeof payload.limit === 'number' && payload.limit > 0 ? payload.limit : 10;
    const explain = payload.explain === true;

    const results = await aku.search(query, {
        recordType: recordType || undefined,
        limit,
        explain,
    });

    if (!results || results.length === 0) {
        return `No results found for query: "${query}".`;
    }

    const lines = [`Search results for: "${query}" (${results.length} found):`];
    for (const result of results) {
        const type = result.record_type || 'unknown';
        const title = result.title || '(no title)';
        const summary = result.summary || '';
        lines.push(`\n[${type}] ${title}`);
        if (summary) {
            lines.push(summary);
        }
        if (explain && result.score !== undefined) {
            lines.push(`Score: ${result.score.toFixed(4)}`);
        }
    }

    return lines.join('\n');
}
