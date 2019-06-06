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
    publicationId: string;
}

interface HourData {
    time: number;
    articles: number[];
}

const cache: Map<string, Promise<PublicationDay | null>> = new Map();
export async function downloadDayPublication(date: Date, publicationId: string): Promise<PublicationDay|null> {
    const dayId = date.toISOString().replace(/[-:]/g, '').substr(0, 8);
    const url = `https://s3-eu-west-1.amazonaws.com/lidovky-headlines/daypub-${dayId}-${publicationId}.json`;
    if(!cache.has(url)) {
        cache.set(url, downloadDayPublicationFromNet(url, publicationId));
    }
    return cache.get(url)!;
}

async function downloadDayPublicationFromNet(url: string, publicationId: string): Promise<PublicationDay|null> {
    try {
        const request = await fetch(url);
        const data = (await request.json()) as PublicationDay;
        cleanupPublication(data);
        data.publicationId = publicationId;
        return data;
    } catch (e) {
        return null;
    }
}
