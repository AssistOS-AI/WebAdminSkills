import {
    getSiteStore,
    listSites,
} from '../../../src/runtime/dataStore.mjs';
import {
    DATASTORE_TYPES,
    CONFIG_FILES,
    SESSION_FILE_SUFFIX,
} from '../../../src/constants/datastore.mjs';

function extractSessionId(fileName) {
    const base = fileName.replace(/\.md$/, '');
    for (const suffix of Object.values(SESSION_FILE_SUFFIX)) {
        const suffixPattern = `-${suffix}`;
        if (base.endsWith(suffixPattern)) {
            return base.slice(0, base.length - suffixPattern.length);
        }
    }
    return base;
}

async function getSiteSummary(siteId) {
    const store = getSiteStore(siteId);
    let sessionIds = [];
    let leadCount = 0;
    let profileCount = 0;
    let ownerSnippet = '(not configured)';

    try {
        const sessions = await store.listFiles(DATASTORE_TYPES.SESSIONS);
        const uniqueIds = new Set();
        for (const fileName of sessions.files) {
            uniqueIds.add(extractSessionId(fileName));
        }
        sessionIds = Array.from(uniqueIds);
    } catch { /* no sessions folder */ }

    try {
        const leads = await store.listFiles(DATASTORE_TYPES.LEADS);
        leadCount = leads.files.length;
    } catch { /* no leads folder */ }

    try {
        const profiles = await store.listFiles(DATASTORE_TYPES.PROFILES);
        profileCount = profiles.files.length;
    } catch { /* no profiles folder */ }

    try {
        const ownerFile = await store.getSectionMap(DATASTORE_TYPES.CONFIG, CONFIG_FILES.OWNER);
        const firstLine = (ownerFile.rawMarkdown || '').split('\n').find((l) => l.trim());
        ownerSnippet = firstLine ? firstLine.trim() : '(empty)';
    } catch { /* no owner config */ }

    return {
        siteId,
        sessionIds,
        leads: leadCount,
        profiles: profileCount,
        ownerSnippet,
    };
}

export async function action() {
    const allSites = await listSites();
    if (allSites.length === 0) {
        return 'No sites found.';
    }

    const summaries = await Promise.all(allSites.map((siteId) => getSiteSummary(siteId)));
    const lines = [`SiteIDs (${summaries.length}):`];
    for (const s of summaries) {
        lines.push(`\n--- ${s.siteId} ---`);
        lines.push(`Sessions: ${s.sessionIds.length > 0 ? s.sessionIds.join(', ') : '(none)'}`);
        lines.push(`Leads: ${s.leads}`);
        lines.push(`Profiles: ${s.profiles}`);
        lines.push(`Owner: ${s.ownerSnippet}`);
    }
    return lines.join('\n');
}
