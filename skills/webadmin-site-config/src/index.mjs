import {
    configureDataStore,
    getDataStore,
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
        throw new Error('webadmin-site-config expects promptText to be valid JSON.');
    }
}

function normalizeTarget(value) {
    const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (!raw) return '';
    const valid = [CONFIG_FILES.OWNER, CONFIG_FILES.POLICY];
    return valid.includes(raw) ? raw : '';
}

export async function action({ promptText }) {
    const payload = parsePayload(promptText);
    const target = normalizeTarget(payload.target);
    if (!target) {
        throw new Error('webadmin-site-config requires a valid target: owner or policy.');
    }

    const store = getDataStore();
    const content = typeof payload.content === 'string' ? payload.content.trim() : '';
    const fields = payload.fields && typeof payload.fields === 'object' && !Array.isArray(payload.fields)
        ? payload.fields
        : null;

    if (fields) {
        let existingContent = '';
        try {
            const existing = await store.getSectionMap(DATASTORE_TYPES.CONFIG, target);
            existingContent = existing.rawMarkdown || '';
        } catch {
            // File does not exist yet.
        }

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
        await store.replaceFile(DATASTORE_TYPES.CONFIG, target, {
            Content: newContent,
        });

        return `Updated ${target} config fields: ${Object.keys(fields).join(', ')}.`;
    }

    if (content) {
        await store.replaceFile(DATASTORE_TYPES.CONFIG, target, {
            Content: content,
        });
        return `Replaced ${target} config.`;
    }

    // Read mode.
    try {
        const file = await store.getSectionMap(DATASTORE_TYPES.CONFIG, target);
        return `${target} config:\n${file.rawMarkdown || '(empty)'}`;
    } catch {
        return `${target} config: (not configured)`;
    }
}
