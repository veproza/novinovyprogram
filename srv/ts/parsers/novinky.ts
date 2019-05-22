import {IArticleData, IParser} from "./interfaces";
import {downloadObject} from "../utils";
import {parse} from "node-html-parser";

const novinkyParser: IParser = async (file) => {
    const content = await downloadObject(file);
    const root = parse(content.toString());

    const elements = [((root as any).querySelector('.topArticle')), ...((root as any).querySelectorAll('.taItem'))];
    const valid = elements
        .map((e: any): IArticleData | null => {
            const headlineElement = e.querySelector('h2') || e.querySelector('h3');
            if(!headlineElement) {
                return null;
            }
            const linkElement = headlineElement.querySelector('a');
            if(!linkElement || !linkElement.attributes) {
                return null;
            }
            const headline = linkElement.rawText.trim();
            const perexElement = e.querySelector('.info p') || e.querySelector('p');
            const perex = perexElement ? perexElement.rawText.trim() : '';
            const link = linkElement.attributes.href;
            return {headline, perex, link};
        })
        .slice(0, 10);
    return (valid.filter((i: IArticleData | null) => i !== null) as IArticleData[]);
};

export default novinkyParser;
