import {parse} from "node-html-parser";
import {downloadObject} from "../utils";
import {IArticleData, IParser} from "./interfaces";

const denikParser: IParser = async (file) => {
    const content = await downloadObject(file);
    const root = parse(content.toString());
    const elements = ((root as any).querySelectorAll('article'));
    const maybeArticles:(IArticleData | null)[] = elements.map((article: any): IArticleData | null => {
        const perexElement = article.querySelector("h4");
        if(!perexElement) {
            return null;
        }
        const headline = article.querySelector("h3").rawText.trim();
        const perex = perexElement.rawText.trim();
        const href = article.querySelector("a").attributes.href;
        const link = href.startsWith('/')
            ? "https://www.denik.cz" + href
            : href;
        return {
            headline,
            perex,
            link
        }
    });
    return maybeArticles.filter(a => a !== null) as IArticleData[];
};

export default denikParser;
