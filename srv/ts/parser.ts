import idnesParser from "./parsers/idnes";
import lidovkyParser from "./parsers/lidovky";
import {IArticleData, IParser} from "./parsers/interfaces";
import aktualneParser from "./parsers/aktualne";
import irozhlasParser from "./parsers/irozhlas";
import novinkyParser from "./parsers/novinky";
import ihnedParser from "./parsers/ihned";
import * as fs from 'fs';
import {downloadObject, getDateFromFileName, uploadObject} from "./utils";
import {TitulkaResult} from "./titulkaInjector";
import bbcParser from "./parsers/bbc";
import ftParser from "./parsers/ft";
import lemondeParser from "./parsers/lemonde";
import wyborczaParser from "./parsers/wyborcza";
import spiegelParser from "./parsers/spiegel";
import seznamzpravyParser from "./parsers/seznamzpravy";
import bleskParser from "./parsers/blesk";
import e15Parser from "./parsers/e15";

type FileAndDate = {
    filename: string;
    date: Date;
    time: number;
}

export type Publication = 'idnes' | 'lidovky' | 'aktualne' | 'irozhlas' | 'novinky' | 'ihned' | 'denik' | 'denikn' | 'bbc' | 'ft' | 'lemonde' | 'wyborcza' | 'spiegel' | 'seznamzpravy' | 'blesk' | 'e15';

export interface DailyResult {
    lastFileTime: number,
    publications: {
        idnes: PublicationDay;
        lidovky: PublicationDay;
        aktualne: PublicationDay;
        irozhlas: PublicationDay;
        novinky: PublicationDay;
        ihned: PublicationDay;
        blesk: PublicationDay;
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

const MAX_ARTICLE_LENGTH = 4;

const datafile = fs.readFileSync(__dirname + '/../data/keys2.txt', 'utf-8');
const files = datafile.split("\n")
    // .slice(1) // remove  -idnes-cz1492763826366.html
    .filter(file => {
        return file.includes('novinky')
    })
    .map((filename): FileAndDate => {
        const date = getDateFromFileName(filename);
        const time = date.getTime();
        return ({
            filename,
            date,
            time
        });
    });


const getTimeBounds = function (referenceTime: number) {
    const dateStart = new Date();
    dateStart.setTime(referenceTime);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date();
    dateEnd.setTime(referenceTime);
    dateEnd.setHours(24, 0, 0, 0);
    return {dateStart, dateEnd};
};

const getPublicationDay = async (publicationId: Publication, files: FileAndDate[]): Promise<PublicationDay> => {
    const parser = getParser(publicationId);
    const matchingFiles = files.filter(f => f.filename.includes( publicationId === 'seznamzpravy' ? 'seznam' : publicationId));
    console.log(publicationId);
    // console.log(matchingFiles.map(f => f.filename));
    const articles: IArticleData[] = [];
    const urlToId: Map<string, number> = new Map();

    const getArticleId = (article: IArticleData): number => {
        const existingId = urlToId.get(article.link);
        if(existingId !== undefined) {
            return existingId;
        }
        const newId = articles.push(article) - 1;
        urlToId.set(article.link, newId);
        return newId;
    };

    const hours = await Promise.all(matchingFiles.map(async (file): Promise<HourData|null> => {
        try {
            const articlesInFile = (await parser(file.filename)).slice(0, MAX_ARTICLE_LENGTH);
            const articleIds = articlesInFile.map(getArticleId);
            return {
                time: file.time,
                articles: articleIds
            };
        } catch (e) {
            console.error("\n", e, publicationId, file.filename, "\n");
            return null;
        }
    }));

    const hoursNotNull: HourData[] = hours.filter(h => h !== null) as HourData[];
    return {
        articles,
        hours: hoursNotNull
    };
};

const downloadDay = async (referenceTime: number, publication: Publication): Promise<PublicationDay> => {
    const {dateStart, dateEnd} = getTimeBounds(referenceTime);
    const timeStart = dateStart.getTime();
    const timeEnd = dateEnd.getTime();
    const matchingFiles = files.filter(f => timeStart <= f.time && f.time <= timeEnd);
    return getPublicationDay(publication, matchingFiles);
};




const getParser = (file: string): IParser => {
    if (file.includes('idnes')) {
        return idnesParser;
    } else if (file.includes('lidovky')) {
        return lidovkyParser;
    } else if (file.includes('aktualne')) {
        return aktualneParser;
    } else if (file.includes('irozhlas')) {
        return irozhlasParser;
    } else if (file.includes('novinky')) {
        return novinkyParser;
    } else if (file.includes('ihned')) {
        return ihnedParser;
    } else if (file.includes('bbc')) {
        return bbcParser;
    } else if (file.includes('ft')) {
        return ftParser;
    } else if (file.includes('lemonde')) {
        return lemondeParser;
    } else if (file.includes('wyborcza')) {
        return wyborczaParser;
    } else if (file.includes('spiegel')) {
        return spiegelParser;
    } else if (file.includes('seznam')) {
        return seznamzpravyParser;
    } else if (file.includes('blesk')) {
        return bleskParser;
    } else if (file.includes('e15')) {
        return e15Parser;
    } else {
        throw new Error("No parser for " + file);
    }
};
//20190717T093131_seznam
const firstReferenceTime = new Date("2019-08-25T10:41:39.138Z").getTime();

const lastReferenceTime = new Date("2019-08-25T10:41:39.138Z").getTime();
let currentReferenceTime = firstReferenceTime;
const publicationId: Publication = 'novinky';

(async () => {
    do {
        const date = new Date(currentReferenceTime);
        console.log("Downloading ", date.toISOString());
        const day = await downloadDay(currentReferenceTime, publicationId);
        const dayId = date.toISOString().replace(/[-:]/g, '').substr(0, 8);
        const key = "daypub-" + dayId + '-'+ publicationId + '.json';
        console.log("Uploading", key);
        try {
            const existing = JSON.parse((await downloadObject(key)).toString()) as PublicationDay;
            existing.articles = day.articles;
            existing.hours = day.hours;
            console.log('Updating');
            await uploadObject(key, existing);

        } catch(e) {
            console.log("Not existing");
            // await uploadObject(key, day);
        }

        // process.exit();

        // console.log('reset');
        // await uploadFile("list.txt", Buffer.from(""), "text/plain");
        // console.log("Done", date.toISOString());
        currentReferenceTime -= 86400 * 1e3;
    } while (currentReferenceTime > lastReferenceTime)
})();
