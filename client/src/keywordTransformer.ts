import {PublicationDay} from "./Downloader";
import {ArticleView, extractToDay} from "./DayExtractor";
import {IArticleData} from "../../srv/ts/parsers/interfaces";
const alreadySeenArticleIds: Map<string, boolean> = new Map();
export const extractEligibleArticlesToDay = async (day: PublicationDay, keyword: string): Promise<ArticleView> => {
    onProcessStart();
    await loadScript('Readability.js');
    const articlesToMatch: Map<IArticleData, boolean> = new Map();

    const notKeywords: string[] = [];
    const yesKeywords: string[] = [];
    keyword.split('|').forEach(keyword => {
        if (keyword[0] === '!') {
            notKeywords.push(keyword.substr(1))
        } else {
            yesKeywords.push(keyword);
        }
    });
    let totalArticleCount = 0;
    let matchingArticleCount = 0;
    await Promise.all(day.articles.map(async (article) => {
        const isMatch = await getArticleMatchesKeyword(article, yesKeywords, notKeywords);
        const articleId = articleToId(article.link);
        if(!alreadySeenArticleIds.get(articleId)) {
            totalArticleCount++;
            if(isMatch) {
                matchingArticleCount++;
            }
            alreadySeenArticleIds.set(articleId, true);
        }
        articlesToMatch.set(article, isMatch);
    }));

    const articleView = extractToDay(day, (article) => articlesToMatch.get(article));
    const matchingCount = articleView.mainArticles.reduce((previousValue, currentValue) => {
        return previousValue + (currentValue.article ? currentValue.seenAt.length : 0);
    }, 0);
    const totalCount = articleView.mainArticles.reduce((previousValue, currentValue) => {
        return previousValue + currentValue.seenAt.length;
    }, 0);
    const date = new Date(day.hours[0].time);
    const dateId = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(d => d.toString().padStart(2, '0')).join('-');
    onProcessEnd({dateId, totalCount, matchingCount, totalArticleCount, matchingArticleCount, publicationId: day.publicationId});

    return articleView;
};

const articleToId = (url: string): string => {
    if(url.includes('novinky.cz')) {
        return url.split('/').pop().split('-')[0]
    } else {
        return url;
    }
}
const getArticleMatchesKeyword = async (article: IArticleData, yesKeywords: string[], notKeywords: string[]) => {
    if(matchKeywords(article.headline, notKeywords) || matchKeywords(article.perex, notKeywords)) {
        return false;
    }
    const content = (await getArticleContent(article.link));
    if(matchKeywords(content, notKeywords)) {
        return false;
    }

    if(matchKeywords(article.headline, yesKeywords) || matchKeywords(article.perex, yesKeywords)) {
        return true;
    }

    return matchKeywords(content, yesKeywords);
};

const matchKeywords = (string: string, keywords: string[]) => {
    return keywords.some(kw => string.includes(kw));
};

const contentPromises: Map<string, Promise<string>> = new Map();
const getArticleContent = (url: string): Promise<string> => {
    if (!contentPromises.has(url)) {
        contentPromises.set(url, downloadArtricleContent(url));
    }
    return contentPromises.get(url);
};

const downloadArtricleContent = async (url: string): Promise<string> => {
    if(url.includes(".ihned.cz")) {
        return "";
    }
    const response = await fetch("https://29pnk6zzeb.execute-api.eu-west-1.amazonaws.com/default?url=" + encodeURIComponent(url));
    const text = await response.text();
    const documentClone = document.cloneNode(true) as any;
    const body = sanitizeBody(getBodyFromHtml(text));
    const element = document.createElement("div");
    element.innerHTML = body;
    documentClone.body.innerHTML = body;
    const reader = new window['Readability'](documentClone);
    const result = reader.parse();
    if(result) {
        return result.textContent.trim()
    } else {
        return "";
    }
};

const sanitizeBody = (body: string) => {
    return body
        .replace(/\n/g, " ")
        .replace(/\r/g, "")
        .replace(/<script(.*?)<\/script(.*?)>/g, '')
        .replace(/<\/?script(.*?)>/g, '')
        .replace(/<svg(.*?)<\/svg(.*?)>/g, '')
        .replace(/<\/?svg(.*?)>/g, '')
        .replace(/<\/?img(.*?)>/g, '')
};

const getBodyFromHtml = (body: string): string => {
    const split = body.split(/<\/?body(.*?)>/i);
    if (split[2]) {
        return split[2];
    }
    return body;
};

let loadingPromise: Promise<void> | null = null;
const loadScript = (src: string): Promise<void> => {
    if (loadingPromise === null) {
        loadingPromise = new Promise(resolve => {
            const element = document.createElement('script');
            element.src = src;
            document.head.appendChild(element);
            element.addEventListener('load', () => resolve());
        });
    }
    return loadingPromise;
};
let loadingCount = 0;
const onProcessStart = () => {
    loadingCount++;
};

type PublicationResult = {
    publicationId: string;
    dateId: string;
    matchingCount: number;
    totalCount: number;
    totalArticleCount: number;
    matchingArticleCount: number;
}
const reporterResults = {};
const onProcessEnd = (result: PublicationResult) => {
    if(reporterResults[result.dateId] === undefined) {
        reporterResults[result.dateId] = {};
    }
    const row = reporterResults[result.dateId];
    row[result.publicationId + "-matching"] = result.matchingCount;
    row[result.publicationId + "-total"] = result.totalCount;
    row[result.publicationId + "-articles-matching"] = result.matchingArticleCount;
    row[result.publicationId + "-articles-total"] = result.totalArticleCount;
    loadingCount--;
    if(loadingCount === 0) {
        console.table(reporterResults);
    }
}
