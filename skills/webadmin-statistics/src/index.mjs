import {
    configureDataStore,
    getDataStore,
} from '../../../src/runtime/dataStore.mjs';
import {
    DATASTORE_TYPES,
    LEAD_SECTIONS,
    LEAD_FIELDS,
} from '../../../src/constants/datastore.mjs';

function parsePayload(promptText) {
    try {
        const parsed = JSON.parse(String(promptText ?? '{}'));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        throw new Error('webadmin-statistics expects promptText to be valid JSON.');
    }
}

function normalizeInterval(value) {
    const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
    const valid = ['day', 'week', 'month'];
    if (!valid.includes(raw)) {
        throw new Error('webadmin-statistics requires interval: day, week, or month.');
    }
    return raw;
}

function getWindowBounds(interval) {
    const now = new Date();
    let start;
    if (interval === 'day') {
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
    } else if (interval === 'week') {
        start = new Date(now);
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
    } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return {
        start: start.toISOString(),
        end: now.toISOString(),
    };
}

function parseEventsMarkdown(rawMarkdown) {
    if (!rawMarkdown || rawMarkdown === '*None*') return [];
    const events = [];
    const entries = rawMarkdown.split('### ').filter(Boolean);
    for (const entry of entries) {
        const lines = entry.split('\n').filter(l => l.trim());
        const fields = {};
        for (const line of lines) {
            const match = line.match(/^- \*\*(.+?)\*\*: ?(.*)$/);
            if (match) {
                fields[match[1].trim()] = match[2].trim();
            }
        }
        if (fields['Event Type'] && fields['Timestamp']) {
            events.push(fields);
        }
    }
    return events;
}

export async function action({ promptText }) {
    const payload = parsePayload(promptText);
    const interval = normalizeInterval(payload.interval);
    const store = getDataStore();
    const { start, end } = getWindowBounds(interval);
    const startDate = new Date(start);

    // Read visit events.
    let visitEvents = [];
    try {
        const visitsFile = await store.getFile(DATASTORE_TYPES.VISITS, 'events');
        visitEvents = parseEventsMarkdown(visitsFile.rawMarkdown);
    } catch {
        // No visits file yet.
    }

    const filteredVisits = visitEvents.filter(e => {
        const ts = new Date(e['Timestamp']);
        return ts >= startDate && ts <= new Date(end);
    });

    const totalVisitors = new Set(filteredVisits.filter(e => e['Event Type'] === 'visit').map(e => e['Visitor ID'])).size;
    const totalSessions = new Set(filteredVisits.filter(e => e['Event Type'] === 'chat-start').map(e => e['Session ID'])).size;

    // Read leads.
    let leads = [];
    try {
        const listing = await store.listFiles(DATASTORE_TYPES.LEADS);
        for (const fileName of listing.files) {
            try {
                const file = await store.getFile(DATASTORE_TYPES.LEADS, fileName);
                const leadInfo = store.parseKeyValue(file.sections?.[LEAD_SECTIONS.LEAD_INFO]);
                const createdAt = leadInfo?.[LEAD_FIELDS.CREATED_AT];
                if (createdAt) {
                    const createdDate = new Date(createdAt);
                    if (createdDate >= startDate && createdDate <= new Date(end)) {
                        leads.push({ fileName, ...leadInfo });
                    }
                }
            } catch {
                // Skip unreadable leads.
            }
        }
    } catch {
        // No leads folder yet.
    }

    const totalLeads = leads.length;
    const conversionRate = totalSessions > 0 ? ((totalLeads / totalSessions) * 100).toFixed(1) : '0.0';

    const leadsByProfile = {};
    for (const lead of leads) {
        const profile = lead[LEAD_FIELDS.PROFILE] || 'unknown';
        leadsByProfile[profile] = (leadsByProfile[profile] || 0) + 1;
    }

    const lines = [
        `Statistics (${interval}):`,
        `Window: ${start.slice(0, 10)} to ${end.slice(0, 10)}`,
        `Total Unique Visitors: ${totalVisitors}`,
        `Total Sessions: ${totalSessions}`,
        `Visitors Without Chat: ${Math.max(0, totalVisitors - totalSessions)}`,
        `Total Leads: ${totalLeads}`,
        `Conversion Rate: ${conversionRate}%`,
    ];

    if (Object.keys(leadsByProfile).length > 0) {
        lines.push('\nLeads By Profile:');
        for (const [profile, count] of Object.entries(leadsByProfile)) {
            lines.push(`- ${profile}: ${count}`);
        }
    }

    return lines.join('\n');
}
