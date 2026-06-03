import {
    configureDataStore,
    getDataStore,
    getConfiguredSiteId,
} from '../../../src/runtime/dataStore.mjs';
import {
    DATASTORE_TYPES,
    SESSION_SECTIONS,
    LEAD_SECTIONS,
    LEAD_FIELDS,
    CONFIG_FILES,
} from '../../../src/constants/datastore.mjs';

function formatSnapshot(label, rawMarkdown) {
    if (!rawMarkdown || rawMarkdown.trim() === '' || rawMarkdown === '*None*') {
        return `${label}: (empty)`;
    }
    return `${label}:\n${rawMarkdown.trim()}`;
}

export async function action({ promptText }) {
    const store = getDataStore();
    const siteId = getConfiguredSiteId();

    const referenceDate = new Date().toISOString().slice(0, 10);

    let knownLeadIds = [];
    try {
        const leads = await store.listFiles(DATASTORE_TYPES.LEADS);
        knownLeadIds = leads.files;
    } catch {
        // No leads folder yet.
    }

    let knownSessionIds = [];
    try {
        const sessions = await store.listFiles(DATASTORE_TYPES.SESSIONS);
        knownSessionIds = sessions.files;
    } catch {
        // No sessions folder yet.
    }

    let knownProfileTemplates = [];
    try {
        const profiles = await store.listFiles(DATASTORE_TYPES.PROFILES);
        knownProfileTemplates = profiles.files;
    } catch {
        // No profiles folder yet.
    }

    let ownerInfoSnapshot = '(not configured)';
    try {
        const ownerFile = await store.getSectionMap(DATASTORE_TYPES.CONFIG, CONFIG_FILES.OWNER);
        ownerInfoSnapshot = ownerFile.rawMarkdown || '(empty)';
    } catch {
        // Owner config not yet created.
    }

    let policySnapshot = '(not configured)';
    try {
        const policyFile = await store.getSectionMap(DATASTORE_TYPES.CONFIG, CONFIG_FILES.POLICY);
        policySnapshot = policyFile.rawMarkdown || '(empty)';
    } catch {
        // Policy config not yet created.
    }

    let websiteInfoFiles = [];
    try {
        const infoFiles = await store.listFiles(DATASTORE_TYPES.INFO);
        websiteInfoFiles = infoFiles.files;
    } catch {
        // No info folder yet.
    }

    const lines = [
        `site_id: ${siteId}`,
        `reference_date: ${referenceDate}`,
        `known_lead_ids: ${knownLeadIds.length > 0 ? knownLeadIds.join(', ') : '(none)'}`,
        `known_session_ids: ${knownSessionIds.length > 0 ? knownSessionIds.join(', ') : '(none)'}`,
        `known_profile_templates: ${knownProfileTemplates.length > 0 ? knownProfileTemplates.join(', ') : '(none)'}`,
        formatSnapshot('owner_info_snapshot', ownerInfoSnapshot),
        formatSnapshot('policy_snapshot', policySnapshot),
        `website_info_files: ${websiteInfoFiles.length > 0 ? websiteInfoFiles.join(', ') : '(none)'}`,
    ];

    return lines.join('\n');
}
