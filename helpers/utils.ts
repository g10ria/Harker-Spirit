import { EventProps } from '../models/event';
import { DateTime } from 'luxon';

import Config from '../config';

export function getCurrentSpiritYear(): number {
    const now = new Date();
    return now.getMonth() >= 7 ? now.getFullYear() + 1 : now.getFullYear();
}

export function getCurrentSpiritYearframe(): string {
    const year = getCurrentSpiritYear();
    return `${year - 1}-${year}`;
}

export function getRandomSpiritYearframe(year: number): string {
    return `${year - 1}-${year}`;
}

export function getCurrentSpiritClasses(): number[] {
    const year = getCurrentSpiritYear();
    return [year + 3, year + 2, year + 1, year];
}

export function getDateString(e: EventProps): string {
    return e.isDateRange ? formatTimeframe(e.dates[0], e.dates[1]) : formatSingleDate(e.dates[0]);
}

export function formatSingleDate(date: Date): string {
    const lux = DateTime.fromJSDate(date);
    const str1 = lux.toLocaleString(DateTime.DATE_FULL);
    return `${str1.substr(0, str1.indexOf(','))}`;
}

export function formatTimeframe(date1: Date, date2: Date): string {
    const str1 = DateTime.fromJSDate(date1).toLocaleString(DateTime.DATE_FULL);
    const str2 = DateTime.fromJSDate(date2).toLocaleString(DateTime.DATE_FULL);
    return `${str1.substr(0, str1.indexOf(','))} - ${str2.substr(0, str2.indexOf(','))}`;
}

export function isAdmin(username: string): boolean {
    return Config.spiritOfficers.includes(username.toLowerCase());
}

export function getRankingString(rank: number): string {
    switch (rank) {
        case 0:
            return '1st';
        case 1:
            return '2nd';
        case 2:
            return '3rd';
        case 3:
            return '4th';
        default:
            return null; // this should never happen
    }
}

export function isProd(): boolean {
    return process.env.NODE_ENV && process.env.NODE_ENV != 'development'

}