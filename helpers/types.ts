// =)

type ClassPoint = {
    eventId: string;
    eventName: string;
    rankingString: string;
    numPoints: number;
    styleString: string; // should include background color & width percentage
};

type ClassSpiritData = {
    classYear: number;
    classColor: string;
    points: ClassPoint[];
    totalPoints: number;
};

type SpiritPage = {
    spiritData: ClassSpiritData[]; // should be in order
    maxPoints: number;
    path: string;
    upcomingEvents: SimpleEvent[];
    allEvents: SimpleEvent[];
    isAdmin: boolean;
    yearframe: string;
    archive: boolean;
};

// For sidebar view
type DetailedEvent = {
    id: string;
    name: string;
    description: string;
    color: string;
    timeframe: string;

    ranking: number[];
    rankingStrings: string[];
    points: number[];
    classLinks: string[][]; // class-specific links
    classLinkNames: string[][];

    globalLinks: string[];
    globalLinkNames: string[];
};

// For list view
type SimpleEvent = {
    id: string;
    name: string;
    color: string;
    timeframe: string;
};

// Same as EventProps minus the year field & replacing _id with id
type AdminEvent = {
    id: string;
    name: string;
    description: string;
    color: string;
    rankingStrings: string[];
    ranking: number[];
    points: number[];
    isDateRange: boolean;
    dates: Date[];
    rawLinks: string[];
    rawNames: string[];
    rawClasses: number[];
    links: {
        categoryName: string;
        links: {
            name: string;
            url: string; // wtf am i doing. links.links.urls
        }[];
    }[];
    dateString: string;
};

type AdminPage = {
    yearframe: string;
    classes: number[];
    adminEvents: AdminEvent[];
};

export { ClassSpiritData, SpiritPage, AdminPage, DetailedEvent, SimpleEvent, AdminEvent };
