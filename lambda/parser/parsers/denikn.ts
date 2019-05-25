import {parse} from "node-html-parser";
import {downloadObject} from "../utils";
import {IArticleData, IParser} from "./interfaces";

const deniknParser: IParser = async (file) => {
    const content = await downloadObject(file);
    const root = parse(content.toString());
    const elements = ((root as any).querySelectorAll('article'));
    const maybeArticles:(IArticleData | null)[] = elements.map((article: any): IArticleData | null => {
        const headlineElement = article.querySelector("h3 span");
        if(!headlineElement) {
            return null;
        }
        const headline = headlineElement.rawText.trim();
        const perex = "";
        const link = article.querySelector("a").attributes.href;
        return {
            headline,
            perex,
            link
        }
    });
    return maybeArticles.filter(a => a !== null) as IArticleData[];
};

export default deniknParser;
