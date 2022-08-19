import Event, { EventProps } from '../models/event';
import { SpiritPage, DetailedEvent, SimpleEvent, AdminEvent } from './types';
import { getCurrentSpiritYear, getDateString, getRankingString, getRandomSpiritYearframe, isProd } from './utils';

// TODO: DOCUMENT!!!

const COLORS = [
    '#585858', // black
    '#FFFFFF', // white
    '#205C26', // green
    '#F2E56C', // yellow
];

// simple events are for display in the list view
export function convertToSimpleEvents(events: EventProps[]): SimpleEvent[] {
    const simpleEvents: SimpleEvent[] = [];
    events.forEach((e) => {
        const timeframe = getDateString(e);
        simpleEvents.push({
            id: e._id,
            name: e.name,
            color: e.color,
            timeframe,
        });
    });
    return simpleEvents;
}

// formats events for display in the admin panel
export function convertToAdminEvents(events: EventProps[]): AdminEvent[] {
    const adminEvents: AdminEvent[] = [];
    events.forEach((e) => {
        const { name, description, color, ranking, points, isDateRange, dates } = e;

        const rawLinks = e.links.map((l) => l.link);
        const rawNames = e.links.map((l) => l.name);
        const rawClasses = e.links.map((l) => l.class);

        const dateString = getDateString(e);
        const rankingStrings: string[] = [];
        ranking.forEach((r, i) => {
            rankingStrings.push(`${r}: ${e.points[i]} points`);
        });
        // Fix, very messy
        const linksMap = new Map<
            string,
            {
                links: string[];
                names: string[];
            }
        >();

        const GLOBAL_STRING = 'General';

        e.links.forEach((l) => {
            const classStr = l.class == 0 ? GLOBAL_STRING : '' + l.class;
            if (!linksMap.has(classStr)) {
                linksMap.set(classStr, {
                    links: [],
                    names: [],
                });
            }
            linksMap.get(classStr).links.push(l.link);
            linksMap.get(classStr).names.push(l.name);
        });

        const links: AdminEvent['links'] = [];
        linksMap.forEach((value, key) => {
            links.push({
                categoryName: key,
                links: value.links.map((l, i) => {
                    return { name: value.names[i], url: l };
                }),
            });
        });

        // Sorting global links to the beginning
        links.sort((l1, l2) => {
            if (l1.categoryName === GLOBAL_STRING) return 1;
            else if (l2.categoryName === GLOBAL_STRING) return 2;
            return 0;
        });

        adminEvents.push({
            rawLinks,
            rawNames,
            rawClasses,
            name,
            description: description || '(No description)',
            color,
            id: e._id,
            dateString,
            rankingStrings,
            links,
            ranking,
            points,
            isDateRange,
            dates,
        });
    });

    // console.log('Admin events:');
    // console.log(adminEvents);

    return adminEvents;
}

export async function getUpcomingEvents(year: number): Promise<SimpleEvent[]> {
    const now = new Date();
    if (isProd()) {
        now.setHours(now.getHours() - 7); // set to california time
    }
    const events = await Event.find({
        year,
        $or: [
            {
                isDateRange: false,
                'dates.0': { $gte: new Date() },
            },
            {
                isDateRange: true,
                'dates.1': { $gte: new Date() },
            },
        ],
    });
    sortEventsByDate(events);
    if (isProd()) {
        events.forEach((e) => {
            e.dates.forEach((d) => {
                d.setHours(d.getHours() - 7);
            });
        });
    }
    return convertToSimpleEvents(events);
}

export async function getAllEvents(year: number): Promise<SimpleEvent[]> {
    const events = await Event.find({ year });
    sortEventsByDate(events);
    if (isProd()) {
        events.forEach((e) => {
            e.dates.forEach((d) => {
                d.setHours(d.getHours() - 7);
            });
        });
    }
    return convertToSimpleEvents(events);
}

export async function getAllAdminEvents(): Promise<AdminEvent[]> {
    const year = getCurrentSpiritYear();
    const events = await Event.find({ year });
    sortEventsByDate(events);
    if (isProd()) {
        events.forEach((e) => {
            e.dates.forEach((d) => {
                d.setHours(d.getHours() - 7);
            });
        });
    }
    return convertToAdminEvents(events);
}

// Converts Event data --> DetailedEvent data (for the sidebar)
export async function getDetailedEventData(id: string): Promise<DetailedEvent> {
    const event = await Event.findOne({ _id: id });
    if (isProd()) {
        event.dates.forEach((d) => {
            d.setHours(d.getHours() - 7);
        });
    }
    if (!event) return null;
    const { ranking, links, name, description, color, points } = event;
    const timeframe = getDateString(event);

    const rankingStrings: string[] = Array(4);
    for (let i = 0; i < 4; i++) {
        rankingStrings[i] = getRankingString(i);
    }

    const classLinks: string[][] = [];
    const classLinkNames: string[][] = [];
    for (let i = 0; i < 4; i++) {
        classLinks.push([]);
        classLinkNames.push([]);
    }
    const globalLinks: string[] = [];
    const globalLinkNames: string[] = [];

    links.forEach((l) => {
        const index = ranking.indexOf(l.class);
        if (index === -1) {
            // global link
            globalLinks.push(l.link);
            globalLinkNames.push(l.name);
        } else {
            classLinks[index].push(l.link);
            classLinkNames[index].push(l.name);
        }
    });

    const detailedEvent: DetailedEvent = {
        name,
        description,
        color,
        ranking,
        points,
        id: event._id,
        timeframe,
        rankingStrings,
        classLinks,
        classLinkNames,
        globalLinks,
        globalLinkNames,
    };

    return detailedEvent;
}

function sortEventsByDate(events: EventProps[]): void {
    events.sort(function (a, b) {
        const aDate = a.isDateRange ? a.dates[1] : a.dates[0];
        const bDate = b.isDateRange ? b.dates[1] : b.dates[0];
        return aDate.valueOf() - bDate.valueOf();
    });
}

export async function getSpiritPageData(year: number, isAdmin: boolean): Promise<SpiritPage> {
    const events = await Event.find({ year });
    if (isProd()) {
        events.forEach((e) => {
            e.dates.forEach((d) => {
                d.setHours(d.getHours() - 7);
            });
        });
    }
    const allEvents = await getAllEvents(year);
    const upcomingEvents = await getUpcomingEvents(year);

    sortEventsByDate(events);

    const path = getCurrentSpiritYear() === year ? '.' : '..';

    if (typeof year === 'string') year = parseInt(year);

    // default values already set
    const data: SpiritPage = {
        spiritData: [
            {
                classYear: year,
                classColor: COLORS[year % 4],
                points: [],
                totalPoints: 0,
            },
            {
                classYear: year + 1,
                classColor: COLORS[(year + 1) % 4],
                points: [],
                totalPoints: 0,
            },
            {
                classYear: year + 2,
                classColor: COLORS[(year + 2) % 4],
                points: [],
                totalPoints: 0,
            },
            {
                classYear: year + 3,
                classColor: COLORS[(year + 3) % 4],
                points: [],
                totalPoints: 0,
            },
        ],
        maxPoints: 0,
        path,
        allEvents,
        upcomingEvents,
        isAdmin,
        yearframe: getRandomSpiritYearframe(year),
        archive: getCurrentSpiritYear() !== year,
    };

    let maxPoints = 0;

    events.forEach((e) => {
        if (e.ranking[0]) {
            for (let i = 0; i < 4; i++) {
                const currClass = e.ranking[i] - year;
                data.spiritData[currClass].points.push({
                    eventId: e._id,
                    eventName: e.name,
                    rankingString: getRankingString(i),
                    numPoints: e.points[i],
                    styleString: '',
                });
                data.spiritData[currClass].totalPoints += e.points[i];

                maxPoints = Math.max(maxPoints, data.spiritData[currClass].totalPoints);
            }
        } else {
            // push a placeholder to the points so that the color indices aren't messed up
            for (let i = 0; i < 4; i++) {
                data.spiritData[i].points.push({
                    eventId: 'dummy',
                    eventName: '',
                    rankingString: '',
                    numPoints: 0,
                    styleString: '',
                });
            }
        }
    });

    maxPoints += 50; // offset (looks better visually)

    // set the background color & width
    for (let i = 0; i < events.length; i++) {
        // iterate over events
        for (let c = 0; c < 4; c++) {
            if (data.spiritData[c].points[i]) {
                data.spiritData[c].points[i].styleString = `
                background-color: #${events[i].color};
                width: ${(100 * data.spiritData[c].points[i].numPoints) / maxPoints}%
                `;
            }
        }
    }

    // remove point chunks that have value 0
    // Not really optimized, but it's okay since C is small
    for (let i = events.length - 1; i >= 0; i--) {
        // iterate over events
        for (let c = 0; c < 4; c++) {
            if (data.spiritData[c].points[i] && data.spiritData[c].points[i].numPoints == 0) {
                data.spiritData[c].points.splice(i, 1);
            }
        }
    }

    // sort in descending order
    data.spiritData.sort((a, b) => b.totalPoints - a.totalPoints);

    return data;
}
