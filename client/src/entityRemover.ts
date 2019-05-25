import {DailyResult} from "./Downloader";

const element = document.createElement('span');
export function entityRemover(input: string) {
    element.innerHTML = input;
    return element.textContent;
}

export function cleanupDay(input: DailyResult) {
    Object.values(input.publications).forEach(publication => {
        publication.articles.forEach(article => {
            article.headline = entityRemover(article.headline);
            article.perex = entityRemover(article.perex);
        });
    });
}
