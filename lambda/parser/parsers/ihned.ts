import {IParser, IArticleData} from "./interfaces";
import {downloadObject} from "../utils";
import * as iconv from "iconv-lite";
import {parse} from "node-html-parser";

const ihnedParser: IParser = async (file) => {
    const content = await downloadObject(file);
    const decoded = iconv.decode(content, 'cp1250');
    const root = parse(decoded);

    const elements = ((root as any).querySelectorAll('article'));
    return elements
        .map((e: any): IArticleData | null => {
            const headlineElement = e.querySelector('h3');
            if (!headlineElement) {
                return null;
            }
            const headline = headlineElement.rawText.trim();
            const perexElement = e.querySelector('.perex');
            if (!perexElement) {
                return null;
            }
            const perex = perexElement.rawText.trim().split("\n").pop().trim();
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

export default ihnedParser;
