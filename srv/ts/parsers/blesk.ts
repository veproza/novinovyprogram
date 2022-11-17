import { IParser, IArticleData } from "./interfaces";
import { downloadObject } from "../utils";
import { parse } from "node-html-parser";

const bleskParser: IParser = async (file) => {
    const content = await downloadObject(file);
    const root = parse(content.toString());
    const elements = ((root as any).querySelectorAll('article'));
    return elements
        .map((e: any): IArticleData | null => {
            const headline = e.attributes['title'];
            console.log(e.attributes);
            if (!headline) {
                return null;
            }
            const perex = '';
            const linkElement = e.querySelector('a');
            if (!linkElement || !linkElement.attributes) {
                return null;
            }
            const link = linkElement.attributes.href;
            return { headline, perex, link };
        })
        .filter((i: IArticleData | null) => i !== null)
        .slice(0, 10);
};

export default bleskParser;
