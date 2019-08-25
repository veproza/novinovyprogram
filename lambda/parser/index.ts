process.env.TZ = 'Europe/Prague';

import {getTitulka} from "./parsers/alza";
import {IArticleData} from "./parsers/interfaces";
import {
    FileAndDate,
    getCurrentList,
    getObject,
    gunzip,
    gzip,
    HourData,
    PublicationDay, setCurrentList,
    uploadObject
} from "./utils";
import {getParser, getPublicationId} from "./parsers/parsers";
import {Lambda} from 'aws-sdk';
const lambda = new Lambda({region: "eu-west-1"});

export type Publication = 'idnes' | 'lidovky' | 'aktualne' | 'irozhlas' | 'novinky' | 'ihned' | 'denik' | 'denikn' | 'bbc' | 'ft' | 'lemonde' | 'wyborcza' | 'spiegel' | 'seznamzpravy' | 'blesk' | 'e15';

const publications: Publication[] = ['idnes', 'lidovky', 'aktualne', 'irozhlas', 'novinky', 'ihned', 'denik', 'denikn', 'bbc', 'ft', 'lemonde', 'wyborcza', 'spiegel', 'seznamzpravy', 'blesk', 'e15'];

const MAX_ARTICLE_LENGTH = 4;
const maxFilesAtOnce = publications.length;

exports.handler = async () => {
    const files = (await getCurrentList())
        .filter(f => getPublicationId(f.filename));
    const remainingList = files.slice(maxFilesAtOnce).map(f => f.filename);
    if(remainingList.length) {
        files.length = maxFilesAtOnce;
    }
    console.log(`Processing ${files.length} files`, files.map(f => f.filename));
    const openFiles = new Map<string, Promise<PublicationDay>>();
    await Promise.all(files
        .map(async (file) => {
            const filename = toResultFilename(file);
            if(!openFiles.has(filename)) {
                openFiles.set(filename, getPublicationFile(filename));
            }
            const daily = await openFiles.get(filename)!;
            return addFileToResult(file, daily);
    }));
    await Promise.all(Array.from(openFiles).map(async ([fileId, publicationResult]) => {
        console.log('uploading', fileId);
        uploadDailyResult(fileId, await publicationResult);
    }));
    console.log('resetting list, remaining: ', remainingList.length);
    await setCurrentList(remainingList.join("\n") + "\n");
    if(remainingList.length) {
        await callParser();
    }
};

const callParser = async () => new Promise((resolve, reject) => {
    lambda.invoke({
        FunctionName: "arn:aws:lambda:eu-west-1:558611468927:function:headline-parser-development",
        InvocationType: "Event"
    }, (err, response) => {
        err ? reject(err) : resolve(response);
    });
});


const getPublicationFile = async (filename: string): Promise<PublicationDay> => {
    try {
        const data = await getObject(filename);
        const json = await gunzip(data);
        return JSON.parse(json.toString()) as PublicationDay;
    } catch (e) {
        return getEmptyPublicationDay();
    }
};

const getEmptyPublicationDay = (): PublicationDay => {
    return {
        hours: [],
        articles: []
    };
};

const addFileToResult = async (file: FileAndDate, publication: PublicationDay): Promise<void> => {
    const alreadyExists = publication.hours.some(existingHour => existingHour.time === file.time);
    if(alreadyExists) {
        console.log('Already existing hour', file.filename);
        return;
    }
    const publicationId = getPublicationId(file.filename)!;
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
            const timeToGetTitulka = publicationId === 'denik' ? 8 : 7;
            if(file.date.getHours() >= timeToGetTitulka) {
                publication.print = null;
                publication.print = await getTitulka(publicationId, file.date);
                console.log('Got titulka', publicationId);
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

const toResultFilename = (file: FileAndDate): string => {
    return `daypub-${toDayId(file.date)}-${getPublicationId(file.filename)}.json`
};

const uploadDailyResult = async (filename: string, content: PublicationDay) => {
    const json = Buffer.from(JSON.stringify(content));
    const compressed = await gzip(json);
    uploadObject(filename, compressed, "application/json", "gzip");
};
