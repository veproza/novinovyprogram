import { IParser, IArticleData } from "./interfaces";
import { downloadObject } from "../utils";
import { parse } from "node-html-parser";
const e15Parser: IParser = async (file) => {
    const content = await downloadObject(file);
    const root = parse(content.toString());
    const elements = [...(root as any).querySelectorAll('.list-article-big-vertical--top-title'), ...(root as any).querySelectorAll('.list-article-medium-horizontal')];
    const existingLinks = new Map<string, boolean>();
    const output = elements
        .map((e: any): IArticleData | null => {
            const headlineElement = e.querySelector('h2');
            if (!headlineElement) {
                return null;
            }
            const headline = headlineElement.rawText.trim();
            if(!headline.length) {
                return null;
            }
            const perexElement = e.querySelector('.perex');
            const perex = perexElement ? perexElement.rawText.trim() : "";
            const linkElement = e.querySelector('.title a');
            if (!linkElement || !linkElement.attributes) {
                return null;
            }
            const link = linkElement.attributes.href;

            return {headline, perex, link};
        })
        .filter((art: IArticleData | null) => {
            if (art === null) {
                return false;
            }
            if(existingLinks.has(art.link)) {
                return false;
            }
            existingLinks.set(art.link, true);
            return true;
        })
        .slice(0, 10);
    return output as IArticleData[];
};

export default e15Parser;
