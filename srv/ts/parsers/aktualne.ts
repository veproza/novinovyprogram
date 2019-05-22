import {IParser, IArticleData} from "./interfaces";
import {downloadObject} from "../utils";
import * as iconv from "iconv-lite";
import {parse} from "node-html-parser";

const aktualneParser: IParser = async (file) => {
    const content = await downloadObject(file);
    const root = parse(content.toString());

    const elements = ((root as any).querySelectorAll('a'));
    return elements
        .map((e: any): IArticleData | null => {
            const attributes = e.attributes;
            if(!attributes['data-ec-pos']) {
                return null;
            }
            const headlineElement = e.querySelector('h2') || e.querySelector('h3');
            if(!headlineElement) {
                return null;
            }
            const headline = headlineElement.rawText.trim();
            const perexElement = e.querySelector('h4') || e.querySelector('p');
            const perex = perexElement ? perexElement.rawText.trim() : '';
            const link = attributes.href;
            return {headline, perex, link};
        })
        .filter((i: IArticleData | null) => i !== null)
        .slice(0, 10);
};

export default aktualneParser;
