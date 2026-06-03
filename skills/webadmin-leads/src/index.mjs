import {
    configureDataStore,
    getDataStore,
} from '../../../src/runtime/dataStore.mjs';
import {
    DATASTORE_TYPES,
    LEAD_SECTIONS,
    LEAD_FIELDS,
    LEAD_STATUSES,
    SESSION_SECTIONS,
    getSessionHistoryFileName,
} from '../../../src/constants/datastore.mjs';

function parsePayload(promptText) {
    try {
        const parsed = JSON.parse(String(promptText ?? '{}'));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        throw new Error('webadmin-leads expects promptText to be valid JSON.');
    }
}

function normalizeAction(value) {
    const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (!raw) return null;
    const valid = ['list', 'read', 'updateStatus'];
    return valid.includes(raw) ? raw : null;
}

function normalizeStatus(value) {
    const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
    const valid = Object.values(LEAD_STATUSES);
    return valid.includes(raw) ? raw : '';
}

function normalizeLeadId(value) {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return '';
    return raw.replace(/[^A-Za-z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '') || '';
}

export async function action({ promptText }) {
    const payload = parsePayload(promptText);
    const store = getDataStore();

    const action = normalizeAction(payload.action);
    const leadId = normalizeLeadId(payload.leadId);
    const rawNewStatus = typeof payload.newStatus === 'string' ? payload.newStatus.trim() : '';
    const newStatus = normalizeStatus(payload.newStatus);

    if (action === 'list' || (!action && !leadId)) {
        const listing = await store.listFiles(DATASTORE_TYPES.LEADS);
        if (listing.files.length === 0) {
            return 'No leads found.';
        }

        const lines = ['Leads:'];
        for (const fileName of listing.files) {
            try {
                const file = await store.getSectionMap(DATASTORE_TYPES.LEADS, fileName);
                const leadInfo = store.parseKeyValue(file.sections?.[LEAD_SECTIONS.LEAD_INFO]);
                const status = leadInfo?.[LEAD_FIELDS.STATUS] || 'unknown';
                const profile = leadInfo?.[LEAD_FIELDS.PROFILE] || '';
                lines.push(`- ${fileName}: status=${status}, profile=${profile}`);
            } catch {
                lines.push(`- ${fileName}: (error reading)`);
            }
        }
        return lines.join('\n');
    }

    if (!leadId) {
        throw new Error('webadmin-leads requires leadId for read/updateStatus.');
    }

    if (action === 'updateStatus' || rawNewStatus) {
        if (!newStatus) {
            throw new Error(`webadmin-leads requires valid newStatus. Valid: ${Object.values(LEAD_STATUSES).join(', ')}.`);
        }

        try {
            const existing = await store.getSectionMap(DATASTORE_TYPES.LEADS, leadId);
            const leadInfo = store.parseKeyValue(existing.sections?.[LEAD_SECTIONS.LEAD_INFO]);
            const updatedLeadInfo = {
                ...leadInfo,
                [LEAD_FIELDS.STATUS]: newStatus,
                [LEAD_FIELDS.UPDATED_AT]: new Date().toISOString(),
            };

            const sections = {
                [LEAD_SECTIONS.LEAD_INFO]: store.renderKeyValue(updatedLeadInfo),
            };
            if (existing.sections?.[LEAD_SECTIONS.MATCH_EXPLANATION]) {
                sections[LEAD_SECTIONS.MATCH_EXPLANATION] = existing.sections[LEAD_SECTIONS.MATCH_EXPLANATION];
            }
            if (existing.sections?.[LEAD_SECTIONS.CONTACT_INFO]) {
                sections[LEAD_SECTIONS.CONTACT_INFO] = existing.sections[LEAD_SECTIONS.CONTACT_INFO];
            }
            if (existing.sections?.[LEAD_SECTIONS.CONSENT]) {
                sections[LEAD_SECTIONS.CONSENT] = existing.sections[LEAD_SECTIONS.CONSENT];
            }
            if (existing.sections?.[LEAD_SECTIONS.CONTACT_ROUTE]) {
                sections[LEAD_SECTIONS.CONTACT_ROUTE] = existing.sections[LEAD_SECTIONS.CONTACT_ROUTE];
            }
            if (existing.sections?.[LEAD_SECTIONS.SUMMARY]) {
                sections[LEAD_SECTIONS.SUMMARY] = existing.sections[LEAD_SECTIONS.SUMMARY];
            }

            await store.replaceFile(DATASTORE_TYPES.LEADS, leadId, sections);
            return `Updated lead ${leadId} status to: ${newStatus}.`;
        } catch (error) {
            if (error.code === 'ENOENT') {
                return `Lead not found: ${leadId}.`;
            }
            throw error;
        }
    }

    // Read action.
    try {
        const file = await store.getSectionMap(DATASTORE_TYPES.LEADS, leadId);
        const lines = [`Lead: ${leadId}`];

        const leadInfo = file.sections?.[LEAD_SECTIONS.LEAD_INFO];
        if (leadInfo) {
            lines.push(`\nLead Info:\n${leadInfo}`);
        }

        const matchExplanation = file.sections?.[LEAD_SECTIONS.MATCH_EXPLANATION];
        if (matchExplanation && matchExplanation !== '*None*') {
            lines.push(`\nMatch Explanation:\n${matchExplanation}`);
        }

        const contactInfo = file.sections?.[LEAD_SECTIONS.CONTACT_INFO];
        if (contactInfo && contactInfo !== '*None*') {
            lines.push(`\nContact Info:\n${contactInfo}`);
        }

        const consent = file.sections?.[LEAD_SECTIONS.CONSENT];
        if (consent && consent !== '*None*') {
            lines.push(`\nConsent:\n${consent}`);
        }

        const summary = file.sections?.[LEAD_SECTIONS.SUMMARY];
        if (summary && summary !== '*None*') {
            lines.push(`\nSummary:\n${summary}`);
        }

        // Try to load related session.
        const parsedLeadInfo = store.parseKeyValue(leadInfo);
        const relatedSessionId = parsedLeadInfo?.[LEAD_FIELDS.SESSION_ID];
        if (relatedSessionId) {
            try {
                const sessionFile = await store.getFile(
                    DATASTORE_TYPES.SESSIONS,
                    getSessionHistoryFileName(relatedSessionId)
                );
                const sessionProfile = sessionFile.sections?.[SESSION_SECTIONS.PROFILE_DETAILS];
                if (sessionProfile && sessionProfile !== '*None*') {
                    lines.push(`\nRelated Session Profile (${relatedSessionId}):\n${sessionProfile}`);
                }
            } catch {
                // Session not found, skip.
            }
        }

        return lines.join('\n');
    } catch (error) {
        if (error.code === 'ENOENT') {
            return `Lead not found: ${leadId}.`;
        }
        throw error;
    }
}
