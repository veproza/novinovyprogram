import {PublicationDay} from "./Downloader";
import {IArticleData} from "../../srv/ts/parsers/interfaces";

interface ArticleView {
    mainArticles: TimedArticle[]
}

export interface TimedArticle {
    startDate: Date,
    endDate: Date | null,
    article: IArticleData;
}

export function extractToDay (day: PublicationDay): ArticleView {
    const mainArticles: TimedArticle[] = [];
    let currentArticleId: number = -1;
    let currentArticleStart: Date = new Date();
    let currentArticleTimesSeen = 0;
    day.hours
        .filter(h => h.articles.length)
        .forEach(hour => {
            if(currentArticleId !== hour.articles[0]) {
                if(currentArticleId !== -1) {
                    mainArticles.push({
                        article: day.articles[currentArticleId],
                        startDate: currentArticleStart,
                        endDate: new Date(hour.time),
                    })
                }
                currentArticleId = hour.articles[0];
                currentArticleStart = new Date(hour.time);
            }
        });
    if(currentArticleId !== -1) {
        mainArticles.push({
            article: day.articles[currentArticleId],
            startDate: currentArticleStart,
            endDate: null
        })
    }
    return {mainArticles};

}
