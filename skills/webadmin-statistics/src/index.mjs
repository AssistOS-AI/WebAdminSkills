import {
    getDataStore,
    getSiteStore,
    listSites,
} from '../../../src/runtime/dataStore.mjs';
import {
    DATASTORE_TYPES,
    LEAD_SECTIONS,
    LEAD_FIELDS,
} from '../../../src/constants/datastore.mjs';

function parsePayload(promptText) {
    const raw = String(promptText ?? '').trim();
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
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

async function getSiteStats(siteId, startDate, endDate) {
    const store = getSiteStore(siteId);
    let visitEvents = [];
    try {
        const visitsFile = await store.getFile(DATASTORE_TYPES.VISITS, 'events');
        visitEvents = parseEventsMarkdown(visitsFile.rawMarkdown);
    } catch { /* no visits file */ }

    const filteredVisits = visitEvents.filter((e) => {
        const ts = new Date(e['Timestamp']);
        return ts >= startDate && ts <= endDate;
    });

    const totalVisitors = new Set(filteredVisits.filter((e) => e['Event Type'] === 'visit').map((e) => e['Visitor ID'])).size;
    const totalSessions = new Set(filteredVisits.filter((e) => e['Event Type'] === 'chat-start').map((e) => e['Session ID'])).size;

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
                    if (createdDate >= startDate && createdDate <= endDate) {
                        leads.push({ fileName, ...leadInfo });
                    }
                }
            } catch { /* skip unreadable leads */ }
        }
    } catch { /* no leads folder */ }

    return {
        siteId,
        visitors: totalVisitors,
        sessions: totalSessions,
        leads: leads.length,
        leadsByProfile: leads.reduce((acc, lead) => {
            const profile = lead[LEAD_FIELDS.PROFILE] || 'unknown';
            acc[profile] = (acc[profile] || 0) + 1;
            return acc;
        }, {}),
    };
}

export async function action({ promptText }) {
    const payload = parsePayload(promptText);
    const interval = normalizeInterval(payload.interval);
    const siteId = typeof payload.siteId === 'string' ? payload.siteId.trim() : '';
    const { start, end } = getWindowBounds(interval);
    const startDate = new Date(start);
    const endDate = new Date(end);

    let sitesToProcess;
    if (siteId && siteId !== 'all') {
        sitesToProcess = [siteId];
    } else {
        sitesToProcess = await listSites();
    }

    if (sitesToProcess.length === 0) {
        return 'No sites found.';
    }

    const siteStats = await Promise.all(sitesToProcess.map((sid) => getSiteStats(sid, startDate, endDate)));

    const totalVisitors = siteStats.reduce((sum, s) => sum + s.visitors, 0);
    const totalSessions = siteStats.reduce((sum, s) => sum + s.sessions, 0);
    const totalLeads = siteStats.reduce((sum, s) => sum + s.leads, 0);
    const conversionRate = totalSessions > 0 ? ((totalLeads / totalSessions) * 100).toFixed(1) : '0.0';

    const lines = [
        `Statistics (${interval}):`,
        siteId && siteId !== 'all' ? `Site: ${siteId}` : `Sites: ${sitesToProcess.length}`,
        `Window: ${start.slice(0, 10)} to ${end.slice(0, 10)}`,
        `Total Unique Visitors: ${totalVisitors}`,
        `Total Sessions: ${totalSessions}`,
        `Visitors Without Chat: ${Math.max(0, totalVisitors - totalSessions)}`,
        `Total Leads: ${totalLeads}`,
        `Conversion Rate: ${conversionRate}%`,
    ];

    const globalLeadsByProfile = {};
    for (const s of siteStats) {
        for (const [profile, count] of Object.entries(s.leadsByProfile)) {
            globalLeadsByProfile[profile] = (globalLeadsByProfile[profile] || 0) + count;
        }
    }

    if (Object.keys(globalLeadsByProfile).length > 0) {
        lines.push('\nLeads By Profile:');
        for (const [profile, count] of Object.entries(globalLeadsByProfile)) {
            lines.push(`- ${profile}: ${count}`);
        }
    }

    if (siteId === 'all' || !siteId) {
        lines.push('\nPer-Site Breakdown:');
        for (const s of siteStats) {
            lines.push(`- ${s.siteId}: visitors=${s.visitors}, sessions=${s.sessions}, leads=${s.leads}`);
        }
    }

    return lines.join('\n');
}
