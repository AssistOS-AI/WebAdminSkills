import {
    getDataStore,
    getSiteStore,
    listSites,
} from '../../../src/runtime/dataStore.mjs';
import {
    DATASTORE_TYPES,
    SESSION_SECTIONS,
    LEAD_SECTIONS,
    LEAD_FIELDS,
    CONFIG_FILES,
} from '../../../src/constants/datastore.mjs';

function parsePayload(promptText) {
    try {
        const parsed = JSON.parse(String(promptText ?? '{}'));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        throw new Error('webadmin-context expects promptText to be valid JSON.');
    }
}

async function getSiteSummary(siteId) {
    const store = getSiteStore(siteId);
    let sessionCount = 0;
    let leadCount = 0;
    let profileCount = 0;
    let ownerSnippet = '(not configured)';

    try {
        const sessions = await store.listFiles(DATASTORE_TYPES.SESSIONS);
        sessionCount = sessions.files.length;
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
        sessions: sessionCount,
        leads: leadCount,
        profiles: profileCount,
        ownerSnippet,
    };
}

export async function action({ promptText }) {
    const payload = parsePayload(promptText);
    const detailSiteId = typeof payload.siteId === 'string' ? payload.siteId.trim() : '';

    if (detailSiteId) {
        const summary = await getSiteSummary(detailSiteId);
        const lines = [
            `Site: ${summary.siteId}`,
            `Sessions: ${summary.sessions}`,
            `Leads: ${summary.leads}`,
            `Profiles: ${summary.profiles}`,
            `Owner: ${summary.ownerSnippet}`,
        ];
        return lines.join('\n');
    }

    const allSites = await listSites();
    if (allSites.length === 0) {
        return 'No sites found.';
    }

    const summaries = await Promise.all(allSites.map((siteId) => getSiteSummary(siteId)));
    const lines = [`Sites (${summaries.length}):`];
    for (const s of summaries) {
        lines.push(`- ${s.siteId}: sessions=${s.sessions}, leads=${s.leads}, profiles=${s.profiles}, owner=${s.ownerSnippet}`);
    }
    return lines.join('\n');
}
