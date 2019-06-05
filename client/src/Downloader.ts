import {IArticleData} from "../../srv/ts/parsers/interfaces";
import {TitulkaResult} from "../../lambda/parser/parsers/alza";
import {cleanupPublication} from "./entityRemover";

export interface DailyResult {
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
    print?: TitulkaResult | null;
}

interface HourData {
    time: number;
    articles: number[];
}

export async function downloadDayPublication(date: Date, publicationId: string): Promise<PublicationDay|null> {
    try {
        const dayId = date.toISOString().replace(/[-:]/g, '').substr(0, 8);
        const request = await fetch(`https://s3-eu-west-1.amazonaws.com/lidovky-headlines/daypub-${dayId}-${publicationId}.json`);
        const data = (await request.json()) as PublicationDay;
        cleanupPublication(data);
        return data;
    } catch (e) {
        return null;
    }
}
