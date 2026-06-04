export const DATASTORE_TYPES = {
    SITES: 'sites',
    SESSIONS: 'sessions',
    PROFILES: 'profiles',
    LEADS: 'leads',
    VISITS: 'visits',
    INFO: 'info',
    CONFIG: 'config',
    ARCHIVE: 'archive',
};

export const SESSION_SECTIONS = {
    PROFILE_DETAILS: 'Profile Details',
    CONTACT_INFORMATION: 'Contact Information',
    HISTORY: 'History',
};

export const SESSION_FILE_SUFFIX = {
    PROFILE: 'profile',
    HISTORY: 'history',
};

export function getSessionProfileFileName(sessionId) {
    return `${sessionId}-${SESSION_FILE_SUFFIX.PROFILE}`;
}

export function getSessionHistoryFileName(sessionId) {
    return `${sessionId}-${SESSION_FILE_SUFFIX.HISTORY}`;
}

export const LEAD_SECTIONS = {
    LEAD_INFO: 'Lead Info',
    MATCH_EXPLANATION: 'Match Explanation',
    CONTACT_INFO: 'Contact Info',
    SUMMARY: 'Summary',
};

export const LEAD_FIELDS = {
    STATUS: 'Status',
    PROFILE: 'Profile',
    SESSION_ID: 'Session ID',
    CREATED_AT: 'Created At',
    UPDATED_AT: 'Updated At',
};

export const LEAD_STATUSES = {
    NEW: 'new',
    APPROVED: 'approved',
    NOT_RELEVANT: 'not-relevant',
    CONTACTED: 'contacted',
    CLOSED: 'closed',
};

export const PROFILE_SECTIONS = {
    CHARACTERISTICS: 'Characteristics',
    INTERESTS: 'Interests',
    QUALIFYING_CRITERIA: 'Qualifying criteria',
    MANDATORY_CONDITIONS: 'Mandatory conditions',
};

export const CONFIG_FILES = {
    OWNER: 'owner',
    POLICY: 'policy',
};

export const ARCHIVE_FOLDERS = {
    SESSIONS: 'sessions',
    LEADS: 'leads',
};
