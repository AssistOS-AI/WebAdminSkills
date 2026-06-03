import {
    configureDataStore,
    getDataStore,
} from '../../../src/runtime/dataStore.mjs';
import {
    DATASTORE_TYPES,
    PROFILE_SECTIONS,
} from '../../../src/constants/datastore.mjs';

function parsePayload(promptText) {
    try {
        const parsed = JSON.parse(String(promptText ?? '{}'));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        throw new Error('webadmin-profiles expects promptText to be valid JSON.');
    }
}

function normalizeAction(value, hasContent) {
    const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (raw) {
        const valid = ['list', 'display', 'create', 'update', 'remove'];
        if (valid.includes(raw)) return raw;
    }
    if (!hasContent) return 'list';
    return 'create';
}

function sanitizeProfileName(name) {
    const raw = typeof name === 'string' ? name.trim() : '';
    if (!raw) return '';
    const safe = raw.replace(/[^A-Za-z0-9._-]/g, '-').replace(/-+/g, '-');
    return safe.replace(/^[-.]+|[-.]+$/g, '') || '';
}

export async function action({ promptText }) {
    const payload = parsePayload(promptText);
    const store = getDataStore();

    const profileName = sanitizeProfileName(payload.profileName);
    const characteristics = Array.isArray(payload.characteristics) ? payload.characteristics : null;
    const interests = Array.isArray(payload.interests) ? payload.interests : null;
    const qualifyingCriteria = Array.isArray(payload.qualifyingCriteria) ? payload.qualifyingCriteria : null;
    const mandatoryConditions = Array.isArray(payload.mandatoryConditions) ? payload.mandatoryConditions : null;
    const hasContent = characteristics || interests || qualifyingCriteria || mandatoryConditions;
    const action = normalizeAction(payload.action, hasContent);

    if (action === 'list') {
        const listing = await store.listFiles(DATASTORE_TYPES.PROFILES);
        if (listing.files.length === 0) {
            return 'No profiles found.';
        }
        return `Profiles:\n${listing.files.map(f => `- ${f}`).join('\n')}`;
    }

    if (action === 'remove') {
        if (!profileName) {
            throw new Error('webadmin-profiles requires profileName for remove.');
        }
        try {
            await store.deleteFile(DATASTORE_TYPES.PROFILES, profileName);
            return `Removed profile: ${profileName}.`;
        } catch (error) {
            if (error.code === 'ENOENT') {
                return `Profile not found: ${profileName}.`;
            }
            throw error;
        }
    }

    if (action === 'display') {
        if (!profileName) {
            throw new Error('webadmin-profiles requires profileName for display.');
        }
        const sections = payload.sections && Array.isArray(payload.sections)
            ? payload.sections
            : null;
        try {
            const file = await store.getFile(DATASTORE_TYPES.PROFILES, profileName, sections);
            const lines = [`Profile: ${profileName}`];
            for (const section of file.sections) {
                lines.push(`\n${section.name}:\n${section.content}`);
            }
            return lines.join('\n');
        } catch (error) {
            if (error.code === 'ENOENT') {
                return `Profile not found: ${profileName}.`;
            }
            throw error;
        }
    }

    // Create or update.
    if (!profileName) {
        throw new Error('webadmin-profiles requires profileName for create/update.');
    }

    const sections = {};
    if (characteristics) {
        sections[PROFILE_SECTIONS.CHARACTERISTICS] = store.renderList(characteristics);
    }
    if (interests) {
        sections[PROFILE_SECTIONS.INTERESTS] = store.renderList(interests);
    }
    if (qualifyingCriteria) {
        sections[PROFILE_SECTIONS.QUALIFYING_CRITERIA] = store.renderList(qualifyingCriteria);
    }
    if (mandatoryConditions) {
        sections[PROFILE_SECTIONS.MANDATORY_CONDITIONS] = store.renderList(mandatoryConditions);
    }

    if (Object.keys(sections).length === 0) {
        throw new Error('webadmin-profiles requires at least one profile section for create/update.');
    }

    await store.replaceFile(DATASTORE_TYPES.PROFILES, profileName, sections);

    const mode = 'create';
    const lines = [`${mode === 'create' ? 'Created' : 'Updated'} profile: ${profileName}.`];
    for (const [name, content] of Object.entries(sections)) {
        const items = store.parseList(content);
        lines.push(`- ${name}: ${items.length} items`);
    }
    return lines.join('\n');
}
