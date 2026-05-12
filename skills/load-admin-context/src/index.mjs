import {
    configureDataStore,
    ensureDataStoreConfigured,
    getDataStore,
} from '../../../dataStore.mjs';
import { DATASTORE_TYPES, SESSION_FILE_SUFFIX } from '../../../datastore.mjs';

async function listMarkdownFiles(store, type) {
    const listing = await store.listFiles(type);
    const files = await Promise.all(
        listing.files.map(async (fileName) => {
            const file = await store.getFile(type, fileName);
            return {
                fileName: `${fileName}.md`,
                content: file.rawMarkdown,
            };
        })
    );
    return files;
}

function combineMarkdownFiles(files, label) {
    if (!Array.isArray(files) || files.length === 0) {
        return '';
    }
    return files
        .map(({ fileName, content }) => `--- [${label}: ${fileName}] ---\n${String(content ?? '').trim()}`)
        .join('\n\n');
}

async function readOwnerInfo(store) {
    try {
        const owner = await store.getFile(DATASTORE_TYPES.CONFIG, 'owner');
        return {
            exists: true,
            fileName: 'owner.md',
            content: owner.rawMarkdown,
        };
    } catch (error) {
        if (error && error.code === 'ENOENT') {
            return {
                exists: false,
                fileName: 'owner.md',
                content: '',
            };
        }
        throw error;
    }
}

function buildSopAssignment(varName, value) {
    return `@${varName} assign ${JSON.stringify(String(value ?? ''))}`;
}

async function listLeadIds() {
    const store = getDataStore();
    const leadFiles = await store.listFiles(DATASTORE_TYPES.LEADS);
    return leadFiles.files.map((fileName) => `${fileName}.md`);
}

async function loadAdminContextData() {
    const store = getDataStore();
    const profileListing = await store.listFiles(DATASTORE_TYPES.PROFILES_INFO);
    const sessionListing = await store.listFiles(DATASTORE_TYPES.SESSIONS);
    const siteInfoFiles = await listMarkdownFiles(store, DATASTORE_TYPES.INFO);
    const ownerInfo = await readOwnerInfo(store);
    const availableProfiles = profileListing.files
        .map((fileName) => `${fileName}.md`)
        .sort((left, right) => left.localeCompare(right));
    const sessionIds = new Set();

    for (const fileName of sessionListing.files) {
        if (fileName.endsWith(`-${SESSION_FILE_SUFFIX.PROFILE}`)) {
            sessionIds.add(fileName.slice(0, -(`-${SESSION_FILE_SUFFIX.PROFILE}`.length)));
            continue;
        }
        if (fileName.endsWith(`-${SESSION_FILE_SUFFIX.HISTORY}`)) {
            sessionIds.add(fileName.slice(0, -(`-${SESSION_FILE_SUFFIX.HISTORY}`.length)));
        }
    }

    const availableSessionIds = Array.from(sessionIds).sort((left, right) => left.localeCompare(right));
    const availableLeadIds = await listLeadIds();

    return {
        combinedProfiles: availableProfiles.length > 0
            ? availableProfiles.join('\n')
            : 'No profiles available.',
        combinedSessionIds: availableSessionIds.length > 0
            ? availableSessionIds.join('\n')
            : 'No sessions available.',
        combinedLeadIds: availableLeadIds.length > 0
            ? availableLeadIds.join('\n')
            : 'No leads available yet.',
        combinedOwnerInfo: ownerInfo.exists
            ? ownerInfo.content.trim()
            : 'No owner info available.',
        combinedSiteInfo: combineMarkdownFiles(siteInfoFiles, 'Info') || 'No site info available.',
    };
}

function buildAdminPreparationAssignments({
    userMessage = '',
    referenceDate = new Date(),
    loadedContext = {},
} = {}) {
    const normalizedDate = referenceDate instanceof Date ? referenceDate.toISOString() : String(referenceDate || '');
    const lines = [
        buildSopAssignment('context_user_message', userMessage),
        buildSopAssignment('context_reference_date', normalizedDate),
        buildSopAssignment('context_known_lead_ids', loadedContext.combinedLeadIds || 'No leads available yet.'),
        buildSopAssignment('context_known_session_ids', loadedContext.combinedSessionIds || 'No sessions available.'),
        buildSopAssignment('context_known_profile_templates', loadedContext.combinedProfiles || 'No profiles available.'),
        buildSopAssignment('context_owner_info_snapshot', loadedContext.combinedOwnerInfo || 'No owner info available.'),
        buildSopAssignment('context_website_info_snapshot', loadedContext.combinedSiteInfo || 'No site info available.'),
    ];
    return lines.join('\n');
}

function parseInput(promptText) {
    let parsed;
    try {
        parsed = JSON.parse(String(promptText ?? '{}'));
    } catch {
        throw new Error('load-admin-context expects promptText to be a valid JSON object.');
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('load-admin-context input must be an object.');
    }
    return parsed;
}

export async function action({ promptText }) {
    let payload;
    try {
        payload = parseInput(promptText);
    } catch (error) {
        return error?.message || 'Invalid input.';
    }

    const dataDir = typeof payload.dataDir === 'string' && payload.dataDir.trim()
        ? payload.dataDir.trim()
        : null;
    const agentRoot = typeof payload.agentRoot === 'string' && payload.agentRoot.trim()
        ? payload.agentRoot.trim()
        : null;

    if (dataDir || agentRoot) {
        configureDataStore({ dataDir, agentRoot });
    } else {
        ensureDataStoreConfigured();
    }

    const loadedContext = await loadAdminContextData();
    const assignments = buildAdminPreparationAssignments({
        userMessage: typeof payload.message === 'string' ? payload.message : '',
        referenceDate: typeof payload.referenceDate === 'string' && payload.referenceDate.trim()
            ? payload.referenceDate.trim()
            : new Date(),
        loadedContext,
    });

    return assignments;
}
