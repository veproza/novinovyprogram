import {IArticleData, IParser} from "./interfaces";
import {downloadObject} from "../utils";
import {parse} from "node-html-parser";
import * as iconv from "iconv-lite";

const wyborczaParser: IParser = async (file) => {
    const content = await downloadObject(file);
    const decoded = iconv.decode(content, 'iso-8859-2');
    const root = parse(decoded.toString());

    const elements = ((root as any).querySelectorAll('.hp-mt-double'));
    const openers = elements
        .map((e: any): IArticleData => {
            const headline = e.rawText.trim();
            const perex = '';
            const link =  e.attributes.href;
            return {headline, perex, link};
        });
    const others = ((root as any).querySelectorAll('.hp-header-holder li'))
        .map((e: any): IArticleData | null => {
            const headlineAndLinkElement = e.querySelector('a.hp-title-1') || e.querySelector('a.hp-title-2');
            if(!headlineAndLinkElement) {
                return null;
            }
            const headline = headlineAndLinkElement.rawText.trim();
            const perex = '';
            const link =  headlineAndLinkElement.attributes.href;
            return {headline, perex, link};
        })
        .filter((i: IArticleData | null) => i !== null)
        .slice(0, 8);
    return [...openers, ...others];

};

export default wyborczaParser;
