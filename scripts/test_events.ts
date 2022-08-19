import { EventProps } from '../models/event';
import { DateTime } from 'luxon';

/**
 * Test events
 */
const TEST_USERS: EventProps[] = [
    {
        year: 2020,
        name: 'Eagle painting',
        description: 'Students painted the eagle',
        ranking: [2021, 2022, 2020, 2023],
        points: [400, 300, 20, 100],
        links: [],
        isDateRange: true,
        dates: [DateTime.local().toJSDate(), DateTime.local().endOf('month').toJSDate()],
        color: '26C6DA',
    },
    {
        year: 2020,
        name: 'Rally',
        description: 'Students did da dances',
        ranking: [2023, 2022, 2021, 2020],
        points: [200, 150, 100, 50],
        links: [
            {
                link: 'https://google.com',
                name: 'Photos',
                class: 2022,
            },
            {
                link: 'https://google.com',
                name: 'Videos',
                class: 2022,
            },
            {
                link: 'https://google.com',
                name: 'Photos',
                class: 2022,
            },
            {
                link: 'https://google.com',
                name: 'Photos',
                class: 2022,
            },
            {
                link: 'https://google.com',
                name: 'Photos',
                class: 2021,
            },
            {
                link: 'https://google.com',
                name: 'All photos',
                class: 0,
            },
        ],
        isDateRange: false,
        dates: [DateTime.local().endOf('week').toJSDate()],
        color: 'E57373',
    },
];

export default TEST_USERS;
