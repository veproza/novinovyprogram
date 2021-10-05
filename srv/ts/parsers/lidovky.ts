import {IParser, IArticleData} from "./interfaces";
import { downloadObject, getDateFromFileName } from "../utils";
import * as iconv from "iconv-lite";
import {parse} from "node-html-parser";

const lidovkyParser: IParser = async (file) => {
    const time = getDateFromFileName(file);
    if (time.toISOString() >= '2021-07-20T08') {
        return lidovkyParser20210720(file);
    } else {
        return lidovkyParserOld(file);
    }
}

const lidovkyParser20210720: IParser = async(file) => {
    const content = await downloadObject(file);
    const decoded = iconv.decode(content, 'cp1250');
    const root = parse(decoded);
    const elements = ((root as any).querySelectorAll('.art'));
    return elements
        .map((e: any): IArticleData | null => {
            const headlineElement = e.querySelector('h3');
            if(!headlineElement) {
                return null;
            }
            const headline = headlineElement.rawText.trim();
            const perexElement = e.querySelector('p');
            const perex = perexElement
                ? perexElement.rawText.trim()
                : '';
            const linkElement = e.querySelector('a');
            if(!linkElement || !linkElement.attributes) {
                return null;
            }
            const link = linkElement.attributes.href;
            return {headline, perex, link};
        })
        .filter((i: IArticleData | null) => i !== null)
        .slice(0, 10);
}

const lidovkyParserOld: IParser = async (file) => {
    const content = await downloadObject(file);
    const decoded = iconv.decode(content, 'cp1250');
    const root = parse(decoded);

    const elements = ((root as any).querySelectorAll('.art'));
    return elements
        .map((e: any): IArticleData | null => {
            const headlineElement = e.querySelector('h1') || e.querySelector('h2');
            if(!headlineElement) {
                return null;
            }
            const headline = headlineElement.rawText.trim();
            const perexElement = e.querySelector('p');
            if(!perexElement) {
                return null;
            }
            const perex = perexElement.rawText.trim();
            const linkElement = e.querySelector('a');
            if(!linkElement || !linkElement.attributes) {
                return null;
            }
            const link = linkElement.attributes.href;
            return {headline, perex, link};
        })
        .filter((i: IArticleData | null) => i !== null)
        .slice(0, 10);
};

export default lidovkyParser;
