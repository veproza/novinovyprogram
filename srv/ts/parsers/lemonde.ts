import {IParser, IArticleData} from "./interfaces";
import {downloadObject} from "../utils";
import {parse} from "node-html-parser";

const lemondeParser: IParser = async (file) => {
    const content = await downloadObject(file);
    const root = parse(content.toString());
    const time = parseInt(file.split("_")[1], 10);
    const elements = ((root as any).querySelectorAll('.article'));
    const newVewsionArticles = elements
        .map((e: any): IArticleData | null => {

            const headlineElement = e.querySelector('.article__title-label') || e.querySelector('.article__title');
            if (!headlineElement) {
                return null;
            }
            const headline = headlineElement.rawText.trim();
            const perexElement = e.querySelector('.article__desc');
            const perex = perexElement ? perexElement.rawText.trim() : '';
            const linkElement = e.querySelector('a');
            if (!linkElement || !linkElement.attributes) {
                return null;
            }
            const href = linkElement.attributes.href;
            const link = href.startsWith('/') ? 'https://www.lemonde.fr' + href : href;
            return {headline, perex, link};
        })
        .filter((i: IArticleData | null) => i !== null)
        .slice(0, 10);
    if(newVewsionArticles.length) {
        return newVewsionArticles
    }
    const oldElements = ((root as any).querySelectorAll('article'));
    return oldElements
        .map((e: any): IArticleData | null => {

            const headlineElement = e.querySelector('h1') || e.querySelector('h2');
            if (!headlineElement) {
                return null;
            }
            const headline = headlineElement.rawText.trim();
            const perexElement = e.querySelector('p');
            const perex = perexElement ? perexElement.rawText.trim() : '';
            const linkElement = e.querySelector('a');
            if (!linkElement || !linkElement.attributes) {
                return null;
            }
            const href = linkElement.attributes.href;
            const link = href.startsWith('/') ? 'https://www.lemonde.fr' + href : href;
            return {headline, perex, link};
        })
        .filter((i: IArticleData | null) => i !== null)
        .slice(0, 10);
};

export default lemondeParser;
