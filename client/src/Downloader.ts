import {IArticleData} from "../../srv/ts/parsers/interfaces";

console.log('foo');
interface DayResponse {
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
    console.log('dl');
    const request = await fetch('./day.json');
    const data = await request.json();
    return {data};
}
