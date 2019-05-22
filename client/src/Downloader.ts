import {IArticleData} from "../../srv/ts/parsers/interfaces";

export interface DayResponse {
    data: DailyResult;
}

interface DailyResult {
    lastFileTime: number,
    publications: {
        idnes: PublicationDay;
        lidovky: PublicationDay;
        aktualne: PublicationDay;
        irozhlas: PublicationDay;
        novinky: PublicationDay;
        ihned: PublicationDay;
    }
}

export interface PublicationDay {
    articles: IArticleData[];
    hours: HourData[];
}

interface HourData {
    time: number;
    articles: number[];
}

export async function downloadDay(date: Date): Promise<DayResponse> {
    const dayId = date.toISOString().replace(/[-:]/g, '').substr(0, 8);
    const request = await fetch(`https://s3-eu-west-1.amazonaws.com/lidovky-headlines/day-${dayId}.json`);
    const data = await request.json();
    return {data};
}
