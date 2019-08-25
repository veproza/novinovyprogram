import {IArticleData, IParser} from "./interfaces";
import {downloadObject} from "../utils";
import {parse} from "node-html-parser";

const novinkyParser: IParser = async (file) => {
    const content = await downloadObject(file);
    const root = parse(content.toString());

    const elements = (root as any).querySelectorAll('main header li');
    const valid = elements
        .map((e: any): IArticleData | null => {
            const headlineElement = e.querySelector('h3');
            if(!headlineElement) {
                return null;
            }
            const linkElement = e.querySelector('a');
            if(!linkElement || !linkElement.attributes) {
                return null;
            }
            const headline = headlineElement.rawText.trim();
            const perexElement = e.querySelector('p');
            const perex = perexElement ? perexElement.rawText.trim() : '';
            const link = linkElement.attributes.href;
            return {headline, perex, link};
        })
        .slice(0, 10);
    return (valid.filter((i: IArticleData | null) => i !== null) as IArticleData[]);
};

export default novinkyParser;
