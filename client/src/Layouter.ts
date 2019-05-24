import {PublicationDay} from "./Downloader";

interface ArticleLayout {
    top: number;
    height: number;
    roundedStartDate: Date;
    roundedEndDate: Date;
    wasUntilMidnight: boolean;
    seenAt: Date[];
}

export const hourHeightPx = 164;
const timeRoundingFactor = 15 * 60000; // 15 minutes

export const roundTime = (date: Date): Date => {
    const roundedTime = Math.round(date.getTime() / timeRoundingFactor) * timeRoundingFactor;
    return new Date(roundedTime);
};

const getDayEndDate = (date: Date): Date => {
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59,999);
    return dayEnd;
};

const getPixelsForDate = (date: Date) => {
    const dayDate = new Date(date);
    dayDate.setHours(0,0,0,0);
    const timeDiff = date.getTime() - dayDate.getTime();
    return timeDiff / 3600000 * hourHeightPx;
};

interface Layoutable {
    startDate: Date;
    endDate: Date | null;
    seenAt: Date[]
}

export function getLayout(articleItem: Layoutable): ArticleLayout {
    const roundedStartDate = roundTime(articleItem.startDate);
    const roundedEndDate = articleItem.endDate
        ? roundTime(articleItem.endDate)
        : getDayEndDate(articleItem.startDate);
    const top = getPixelsForDate(roundedStartDate);
    const bottom = getPixelsForDate(roundedEndDate);
    const height = bottom - top;
    return {
        top,
        height,
        roundedStartDate: roundedStartDate,
        roundedEndDate: roundedEndDate,
        wasUntilMidnight: articleItem.endDate === null,
        seenAt: articleItem.seenAt
    };
}

export function getTimeTicks(publication: PublicationDay): Date[] {
    const time = publication.hours[0].time;
    const startDate = new Date(time);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(time);
    endDate.setHours(24,0,0,0);
    const endTime = endDate.getTime();
    let currentTime = startDate.getTime();
    const output: Date[] = [];
    while (currentTime < endTime) {
        output.push(new Date(currentTime));
        currentTime += 3600 * 1e3;
    }
    return output;
}
