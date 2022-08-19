import mongoose from '../db';

const EventSchema = new mongoose.Schema({
    year: {
        type: Number, // For the 2019-2020 school year, this would be 2020
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    ranking: [
        {
            type: Number,
        },
    ],
    points: [
        {
            type: Number,
        },
    ],
    color: {
        type: String,
        required: true,
    },
    links: [
        // they can also attach links
        {
            link: String,
            name: String,
            class: Number,
        },
    ],
    /**
     * If the length of dates is 1, that's the singular date of the event (for example,
     * things like class dance).
     * If the length of dates is more than 2, then the event consists of a set
     * of distinct dates (for example, things like tug-of-war).
     * If the length of dates is equal to 2, the event can consist either of
     * two distinct dates or of the date range between those two dates,
     * and it refers to the isDateRange boolean to determine which one.
     */
    isDateRange: {
        type: Boolean,
        required: true,
        default: false,
    },
    dates: [
        {
            type: Date, // ISO string
        },
    ],
});

export type EventProps = {
    _id?: string;
    year: number;
    name: string;
    description: string;
    ranking: number[];
    points: number[];
    color: string;
    links: {
        link: string;
        name: string;
        class: number;
    }[];
    isDateRange: boolean;
    dates: Date[];
};

export type EventType = mongoose.Document & EventProps;

export default mongoose.model<EventType>('Event', EventSchema);
