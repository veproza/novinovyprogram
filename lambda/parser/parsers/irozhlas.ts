import {IParser, IArticleData} from "./interfaces";
import {downloadObject} from "../utils";
import * as iconv from "iconv-lite";
import {parse} from "node-html-parser";

const irozhlasParser: IParser = async (file) => {
    const content = await downloadObject(file);
    const root = parse(content.toString());

    const elements = ((root as any).querySelectorAll('article'));
    return elements
        .map((e: any): IArticleData | null => {

            const headlineElement = e.querySelector('h3');
            if(!headlineElement) {
                return null;
            }
            const headline = headlineElement.rawText.trim();
            const perexElement = e.querySelector('p.text-sm');
            const perex = perexElement ? perexElement.rawText.trim() : '';
            const linkElement = e.querySelector('a');
            if(!linkElement || !linkElement.attributes) {
                return null;
            }
            const link = 'https://www.irozhlas.cz' + linkElement.attributes.href;
            return {headline, perex, link};
        })
        .filter((i: IArticleData | null) => i !== null)
        .slice(0, 10);
};

export default irozhlasParser;
