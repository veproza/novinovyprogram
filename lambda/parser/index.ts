process.env.TZ = 'Europe/Prague';

import {getTitulka} from "./parsers/alza";
import {IArticleData} from "./parsers/interfaces";
import {
    DailyResult,
    FileAndDate,
    getCurrentList,
    getObject,
    gunzip,
    gzip,
    HourData,
    PublicationDay, resetCurrentList,
    uploadObject
} from "./utils";
import {getParser, getPublicationId} from "./parsers/parsers";

export type Publication = 'idnes' | 'lidovky' | 'aktualne' | 'irozhlas' | 'novinky' | 'ihned';

const publications: Publication[] = ['idnes', 'lidovky', 'aktualne', 'irozhlas', 'novinky', 'ihned'];

const MAX_ARTICLE_LENGTH = 4;

exports.handler = async () => {
    const files = (await getCurrentList())
        .filter(f => getPublicationId(f.filename));
    console.log(`Processing ${files.length} files`);
    const openDailies = new Map<string, Promise<DailyResult>>();
    await Promise.all(files
        .map(async (file) => {
            const fileId = toResultFilename(file.date);
            if(!openDailies.has(fileId)) {
                openDailies.set(fileId, getDailyJson(file.date));
            }
            const daily = await openDailies.get(fileId)!;
            return addFileToResult(file, daily);
    }));
    await Promise.all(Array.from(openDailies).map(async ([fileId, dailyResult]) => {
        uploadDailyResult(fileId, await dailyResult);
    }));
    await resetCurrentList();
};

const getDailyJson = async (date: Date): Promise<DailyResult> => {
    try {
        const data = await getObject(toResultFilename(date));
        const json = await gunzip(data);
        return JSON.parse(json.toString()) as DailyResult;
    } catch (e) {
        return getEmptyDailyResult();
    }
};


const getEmptyDailyResult= (): DailyResult => {
    return {
        lastFileTime: Date.now(),
        publications: {
            aktualne: getEmptyPublicationDay(),
            idnes: getEmptyPublicationDay(),
            ihned: getEmptyPublicationDay(),
            irozhlas: getEmptyPublicationDay(),
            lidovky: getEmptyPublicationDay(),
            novinky: getEmptyPublicationDay()
        }
    }

};

const getEmptyPublicationDay = (): PublicationDay => {
    return {
        hours: [],
        articles: []
    };
};

const addFileToResult = async (file: FileAndDate, dailyResult: DailyResult): Promise<void> => {
    const publicationId = getPublicationId(file.filename)!;
    const publication = dailyResult.publications[publicationId];
    const parser = getParser(publicationId)!;
    try {
        const articlesInFile = (await parser(file.filename)).slice(0, MAX_ARTICLE_LENGTH);
        const articles: IArticleData[] = publication.articles;
        // noinspection JSMismatchedCollectionQueryUpdate
        const hours: HourData[] = publication.hours;
        const urlToId: Map<string, number> = new Map();
        articles.forEach((article, index) => urlToId.set(article.link, index));

        const getArticleId = (article: IArticleData): number => {
            const existingId = urlToId.get(article.link);
            if (existingId !== undefined) {
                return existingId;
            }
            const newId = articles.push(article) - 1;
            urlToId.set(article.link, newId);
            return newId;
        };
        const articleIds = articlesInFile.map(getArticleId);
        const hour: HourData = {time: file.time, articles: articleIds};
        hours.push(hour);
        hours.sort((a, b) => a.time - b.time);
        if(publication.print === undefined) {
            if(file.date.getHours() >= 5) {
                publication.print = null;
                publication.print = await getTitulka(publicationId, file.date);
            }
        }
    } catch (e) {
        console.error("\n", e, publicationId, file.filename, "\n");
    }
};

const toDayId = (date: Date): string => {
    const y = (date.getFullYear()).toString();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = (date.getDate()).toString().padStart(2, '0');
    return y + m + d;
};

const toResultFilename = (date: Date): string => {
    return `day-${toDayId(date)}.json`
};

const uploadDailyResult = async (filename: string, content: DailyResult) => {
    const json = Buffer.from(JSON.stringify(content));
    const compressed = await gzip(json);
    uploadObject(filename, compressed, "application/json", "gzip");
};
