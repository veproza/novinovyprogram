import {PublicationDay} from "./Downloader";
import {IArticleData} from "../../srv/ts/parsers/interfaces";
import {TitulkaResult} from "../../lambda/parser/parsers/alza";
import {getPublicationId} from "../../lambda/parser/parsers/parsers";

export interface ArticleView {
    mainArticles: TimedArticle[]
    print: TitulkaResult | null;
}

export interface TimedArticle {
    startDate: Date;
    endDate: Date | null;
    article: IArticleData;
    seenAt: SeenAtData[];
    position?: number;
}

export interface SeenAtData {
    date: Date;
    articles: IArticleData[];
    lastSeenAt: SeenAtData | null;
    nextSeenAt?: SeenAtData;
}

type ArticleFilter = (article: IArticleData) => boolean;

export function extractToDay (day: PublicationDay, articleFilter?: ArticleFilter): ArticleView {
    if(day === undefined) {
        // when viewing days before the publication was actually added
        day = getEmptyPublicationDay();
    }
    const mainArticles: TimedArticle[] = [];
    let currentArticleId: number | undefined = undefined;
    let currentArticleStart: Date = new Date(day.hours.length ? day.hours[0].time : 0);
    let lastSeenAt: SeenAtData | null;
    let currentSeenAt: SeenAtData[] = [];
    day.hours
        .filter(h => h.articles.length)
        .forEach(hour => {
            const eligibleArticles = articleFilter
                ? hour.articles.filter(articleId => articleFilter(day.articles[articleId]))
                : hour.articles;
            if(currentArticleId !== eligibleArticles[0]) {
                if(currentSeenAt.length) {
                    mainArticles.push({
                        article: day.articles[currentArticleId],
                        startDate: currentArticleStart,
                        endDate: new Date(hour.time),
                        seenAt: currentSeenAt
                    })
                }
                currentArticleId = eligibleArticles[0];
                currentArticleStart = new Date(hour.time);
                currentSeenAt = [];
            }
            const seenAt: SeenAtData = {
                date: new Date(hour.time),
                articles: hour.articles.map(i => day.articles[i]),
                lastSeenAt
            };
            if(lastSeenAt) {
                lastSeenAt.nextSeenAt = seenAt;
            }
            currentSeenAt.push(seenAt);
            lastSeenAt = seenAt;
        });
    if(currentSeenAt.length) {
        mainArticles.push({
            article: day.articles[currentArticleId],
            startDate: currentArticleStart,
            endDate: null,
            seenAt: currentSeenAt
        })
    }
    const print = day.print || null;
    return {mainArticles, print};

}


const getEmptyPublicationDay = (): PublicationDay => {
    return {
        hours: [],
        articles: [],
        publicationId: ""
    };
};
