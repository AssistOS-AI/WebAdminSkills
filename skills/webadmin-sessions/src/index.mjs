import {
    configureDataStore,
    getDataStore,
} from '../../../src/runtime/dataStore.mjs';
import {
    DATASTORE_TYPES,
    SESSION_SECTIONS,
    getSessionHistoryFileName,
} from '../../../src/constants/datastore.mjs';

function parsePayload(promptText) {
    try {
        const parsed = JSON.parse(String(promptText ?? '{}'));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        throw new Error('webadmin-sessions expects promptText to be valid JSON.');
    }
}

function normalizeAction(value) {
    const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (!raw) return null;
    const valid = ['list', 'read'];
    return valid.includes(raw) ? raw : null;
}

export async function action({ promptText }) {
    const payload = parsePayload(promptText);
    const store = getDataStore();

    const action = normalizeAction(payload.action);
    const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId.trim() : '';
    const historyLimit = typeof payload.historyLimit === 'number' ? payload.historyLimit : 10;
    const includeFullHistory = payload.includeFullHistory === true;

    if (action === 'list' || (!action && !sessionId)) {
        const listing = await store.listFiles(DATASTORE_TYPES.SESSIONS);
        if (listing.files.length === 0) {
            return 'No sessions found.';
        }
        return `Sessions:\n${listing.files.map(f => `- ${f}`).join('\n')}`;
    }

    if (!sessionId) {
        throw new Error('webadmin-sessions requires sessionId for read.');
    }

    const fileName = getSessionHistoryFileName(sessionId);
    try {
        const file = await store.getSectionMap(DATASTORE_TYPES.SESSIONS, fileName);
        const lines = [`Session: ${sessionId}`];

        const profiles = file.sections?.[SESSION_SECTIONS.TARGET_PROFILES];
        if (profiles && profiles !== '*None*') {
            lines.push(`\nTarget Profiles:\n${profiles}`);
        }

        const profileDetails = file.sections?.[SESSION_SECTIONS.PROFILE_DETAILS];
        if (profileDetails && profileDetails !== '*None*') {
            lines.push(`\nProfile Details:\n${profileDetails}`);
        }

        const contactInfo = file.sections?.[SESSION_SECTIONS.CONTACT_INFORMATION];
        if (contactInfo && contactInfo !== '*None*') {
            lines.push(`\nContact Information:\n${contactInfo}`);
        }

        const consent = file.sections?.[SESSION_SECTIONS.CONSENT];
        if (consent && consent !== '*None*') {
            lines.push(`\nConsent:\n${consent}`);
        }

        const history = file.sections?.[SESSION_SECTIONS.HISTORY];
        if (history && history !== '*None*') {
            const entries = store.parseDialogue(history);
            const limited = includeFullHistory ? entries : entries.slice(0, historyLimit);
            const rendered = store.renderDialogue(limited);
            lines.push(`\nHistory (${limited.length} messages):\n${rendered}`);
        }

        return lines.join('\n');
    } catch (error) {
        if (error.code === 'ENOENT') {
            return `Session not found: ${sessionId}.`;
        }
        throw error;
    }
}
