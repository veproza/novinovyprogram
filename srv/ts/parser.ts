import idnesParser from "./parsers/idnes";
import lidovkyParser from "./parsers/lidovky";
import {IArticleData, IParser} from "./parsers/interfaces";
import aktualneParser from "./parsers/aktualne";
import irozhlasParser from "./parsers/irozhlas";
import novinkyParser from "./parsers/novinky";
import ihnedParser from "./parsers/ihned";
import * as fs from 'fs';

type FileAndDate = {
    filename: string;
    date: Date;
    time: number;
}

type Publication = 'idnes' | 'lidovky' | 'aktualne' | 'irozhlas' | 'novinky' | 'ihned';

const publications: Publication[] = ['idnes', 'lidovky', 'aktualne', 'irozhlas', 'novinky', 'ihned'];

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

interface PublicationDay {
    articles: IArticleData[];
    hours: HourData[];
}

interface HourData {
    time: number;
    articles: number[];
}

const MAX_ARTICLE_LENGTH = 4;

const getDateFromFileName = (filename: string): Date => {
    try {
        if (filename.startsWith('20')) {
            // 20190517T130127_ihned-cz.html
            //2019-05-20T12:29:25.476Z
            const date = filename.split("_")[0];
            const isoDate = date.substr(0, 4) + '-' + date.substr(4, 2) + '-' + date.substr(6, 2);
            const isoTime = date.substr(9, 2) + ':' + date.substr(11, 2) + ':' + date.substr(13, 2);
            const isoDateTime = isoDate + 'T' + isoTime + '.000Z';
            return new Date(isoDateTime);
        } else {
            // aktualne-cz_1529537487974.html
            const time = filename.split('_')[1].split('.')[0];
            const d = new Date();
            d.setTime(parseInt(time, 10));
            return d;
        }
    } catch (e) {
        throw new Error("Unparsable: " + filename);
    }
};

const files = fs.readFileSync(__dirname + '/../data/keys.txt', 'utf-8').split("\n")
    .slice(1) // remove  -idnes-cz1492763826366.html
    .filter(file => {
        return file.includes('idnes')
            || file.includes('lidovky')
            || file.includes('aktualne')
            || file.includes('irozhlas')
            || file.includes('novinky')
            || file.includes('ihned');
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

const firstReferenceTime = Date.now() - 86400 * 1e3 * 7;
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

    const matchingFiles = files.filter(f => f.filename.includes(publicationId));
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

    const hours = await Promise.all(matchingFiles.map(async (file): Promise<HourData> => {
        const articlesInFile = (await parser(file.filename)).slice(0, MAX_ARTICLE_LENGTH);
        const articleIds = articlesInFile.map(getArticleId);
        return {
            time: file.time,
            articles: articleIds
        };
    }));

    return {
        articles,
        hours
    };
};

const downloadDay = async (referenceTime: number): Promise<DailyResult> => {
    const {dateStart, dateEnd} = getTimeBounds(referenceTime);
    const timeStart = dateStart.getTime();
    const timeEnd = dateEnd.getTime();
    const matchingFiles = files.filter(f => timeStart <= f.time && f.time <= timeEnd);

    const responses = await Promise.all(publications.map(((publication: Publication): Promise<PublicationDay> => {
        return getPublicationDay(publication, matchingFiles);
    })));
    const lastMatchingFile = matchingFiles[matchingFiles.length - 1];
    return {
        lastFileTime: lastMatchingFile.time,
        publications: {
            idnes: responses[0],
            lidovky: responses[1],
            aktualne: responses[2],
            irozhlas: responses[3],
            novinky: responses[4],
            ihned: responses[5]
        }
    };
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
    } else {
        throw new Error("No parser for " + file);
    }
};

(async () => {
    const file = files.pop();
    if (!file) {
        return;
    }
    const day = await downloadDay(firstReferenceTime);
    fs.writeFileSync(__dirname + "/../data/day.json", JSON.stringify(day, null, 2));
})();
