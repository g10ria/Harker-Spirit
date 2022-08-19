import { getCurrentSpiritYear, getRankingString, getCurrentSpiritYearframe } from './utils';
import Event from '../models/event';

export function validateCreate(name: string, isDateRange: boolean, rawDates: string[]): string {
    if (name.length == 0) return 'Please enter event name';

    const year = getCurrentSpiritYear();
    const dates: Date[] = rawDates.map((d) => new Date(d));

    if (!isDateRange) {
        if (dates.length != 1) return 'One date only'; // shouldn't happen
        if (!rawDates[0]) return 'Invalid date entered';
    }
    if (isDateRange) {
        if (dates.length != 2) return 'Two dates only'; // shouldn't happen
        if (!rawDates[0]) return 'Invalid start date entered';
        if (!rawDates[1]) return 'Invalid end date entered';
        if (dates[1].valueOf() <= dates[0].valueOf()) return 'Dates must be in order';
    }
    for (const d of dates) {
        if (d.getFullYear() === year) {
            if (d.getMonth() > 5) return `Must be within the ${getCurrentSpiritYearframe()} school year`;
        } else if (d.getFullYear() === year - 1) {
            if (d.getMonth() < 7) return `Must be within the ${getCurrentSpiritYearframe()} school year`;
        } else return `Must be within the ${getCurrentSpiritYearframe()} school year`;
    }

    return '';
}

export async function validateRanking(rankingId: string, points: string[], ranking: string[]): Promise<string> {
    const targetEvent = await Event.findOne({ _id: rankingId });
    if (!targetEvent) return 'There was an error updating the ranking';
    const year = getCurrentSpiritYear();

    // 1 class selected for each place
    for (let i = 0; i < 4; i++) {
        if (!ranking[i]) return `Please select a ${getRankingString(i)} place`;
        let parsedRanking;
        try {
            parsedRanking = parseInt(ranking[i]);
        } catch (e) {
            // Shouldn't happen from official client
            return `Invalid class selected for ${getRankingString(i)} place`;
        }
        // Shouldn't happen from official client
        if (parsedRanking - year < 0 || parsedRanking - year > 3)
            return `Invalid class selected for ${getRankingString(i)} place`;
    }
    // no duplicate classes selected
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < i; j++) {
            if (ranking[j] === ranking[i]) return `${ranking[i]} is selected twice`;
        }
    }
    // points are not empty strings
    for (let i = 0; i < 4; i++) {
        if (!points[i]) return `Please enter points for ${getRankingString(i)} place`;
    }
    // points are valid positive integers with no 'e' (scientific notation)
    const parsedPoints = Array(4);
    for (let i = 0; i < 4; i++) {
        try {
            parsedPoints[i] = parseInt(points[i]);
        } catch (e) {
            // for things like '--3'
            return `Invalid input for ${getRankingString(i)} place points`;
        }
        if (points[i].includes('e')) return `No scientific notation`;
        if (points[i].includes('.')) return `No decimal point values`;
        if (points[i].includes('-')) return `No negative point values`;
    }
    // points must be increasing in magnitude
    for (let i = 1; i < 4; i++) {
        if (parsedPoints[i] > parsedPoints[i - 1]) return `Points must be increasing`;
    }
}
