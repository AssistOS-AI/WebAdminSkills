import {
    getSiteStore,
} from '../../../src/runtime/dataStore.mjs';
import {
    DATASTORE_TYPES,
    CONFIG_FILES,
} from '../../../src/constants/datastore.mjs';

function parsePayload(promptText) {
    try {
        const parsed = JSON.parse(String(promptText ?? '{}'));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        throw new Error('webadmin-ownerInfo expects promptText to be valid JSON.');
    }
}

function normalizeAction(value) {
    const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (!raw) return null;
    const valid = ['read', 'update', 'list'];
    return valid.includes(raw) ? raw : null;
}

export async function action({ promptText }) {
    const payload = parsePayload(promptText);
    const siteId = typeof payload.siteId === 'string' ? payload.siteId.trim() : '';
    if (!siteId) {
        throw new Error('webadmin-ownerInfo requires siteId.');
    }

    const action = normalizeAction(payload.action);
    const store = getSiteStore(siteId);
    const content = typeof payload.content === 'string' ? payload.content.trim() : '';
    const fields = payload.fields && typeof payload.fields === 'object' && !Array.isArray(payload.fields)
        ? payload.fields
        : null;

    if (action === 'read' || (!action && !content && !fields)) {
        try {
            const file = await store.getSectionMap(DATASTORE_TYPES.CONFIG, CONFIG_FILES.OWNER);
            return `Owner contact info (${siteId}):\n${file.rawMarkdown || '(empty)'}`;
        } catch {
            return `Owner contact info (${siteId}): (not configured)`;
        }
    }

    if (content) {
        await store.replaceFile(DATASTORE_TYPES.CONFIG, CONFIG_FILES.OWNER, {
            Content: content,
        });
        return `Replaced owner contact info for site: ${siteId}.`;
    }

    if (fields) {
        let existingContent = '';
        try {
            const existing = await store.getSectionMap(DATASTORE_TYPES.CONFIG, CONFIG_FILES.OWNER);
            existingContent = existing.rawMarkdown || '';
        } catch { /* file does not exist yet */ }

        const existingLines = existingContent ? existingContent.split('\n') : [];
        const updatedLines = [];
        const updatedKeys = new Set();

        for (const line of existingLines) {
            let replaced = false;
            for (const [key, value] of Object.entries(fields)) {
                const prefix = `- **${key}**:`;
                if (line.trim().startsWith(prefix)) {
                    updatedLines.push(`- **${key}**: ${String(value ?? '').trim()}`);
                    updatedKeys.add(key);
                    replaced = true;
                    break;
                }
            }
            if (!replaced) {
                updatedLines.push(line);
            }
        }

        for (const [key, value] of Object.entries(fields)) {
            if (!updatedKeys.has(key)) {
                updatedLines.push(`- **${key}**: ${String(value ?? '').trim()}`);
            }
        }

        const newContent = updatedLines.filter(l => l.trim()).join('\n');
        await store.replaceFile(DATASTORE_TYPES.CONFIG, CONFIG_FILES.OWNER, {
            Content: newContent,
        });

        return `Updated owner contact fields: ${Object.keys(fields).join(', ')} for site: ${siteId}.`;
    }

    throw new Error('webadmin-ownerInfo requires action, content, or fields.');
}
