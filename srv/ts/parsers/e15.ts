import { IParser, IArticleData } from "./interfaces";
import { downloadObject } from "../utils";
import { parse } from "node-html-parser";

const e15Parser: IParser = async (file) => {
    const content = await downloadObject(file);
    const root = parse(content.toString());
    const elements = [...(root as any).querySelectorAll('.list-article-big-vertical--top-title'), ...(root as any).querySelectorAll('.list-article-medium-horizontal')];
    
    return elements
        .map((e: any): IArticleData | null => {
            const headlineElement = e.querySelector('h2');
            if (!headlineElement) {
                return null;
            }
            const headline = headlineElement.rawText.trim();
            const perexElement = e.querySelector('.perex');
            if(!perexElement) {
                return null;
            }
            const perex = perexElement.rawText.trim();
            const linkElement = e.querySelector('a');
            if (!linkElement || !linkElement.attributes) {
                return null;
            }
            const link = linkElement.attributes.href;

            return {headline, perex, link};
        })
        .filter((i: IArticleData | null) => i !== null)
        .slice(0, 10);
};

export default e15Parser;
