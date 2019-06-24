import { IParser, IArticleData } from "./interfaces";
import { downloadObject } from "../utils";
import { parse } from "node-html-parser";

const bleskParser: IParser = async (file) => {
    const content = await downloadObject(file);
    const root = parse(content.toString());
    const elements = [...(root as any).querySelectorAll('.item-middle-top'), ...(root as any).querySelectorAll('.item-middle')];
    const pageArticles = elements
        .map((e: any): IArticleData | null => {
            const headlineElement = e.querySelector('h3');
            if (!headlineElement) {
                return null;
            }
            const headline = headlineElement.rawText.trim();
            const perex = '';

            const linkElement = e.querySelector('a');
            if (!linkElement || !linkElement.attributes) {
                return null;
            }
            const link = linkElement.attributes.href;
            return {headline, perex, link};
        })
        .filter((i: IArticleData | null) => i !== null) as IArticleData[];
    const promoImage = (root as any).querySelector('img.promoImage');
    if(promoImage) {
        const articleData: IArticleData = {
            headline: promoImage.attributes['alt'],
            perex: '',
            link: promoImage.parentNode.attributes.href
        };
        if(articleData.headline && articleData.link) {
            pageArticles.unshift(articleData);
        }
    }
    return pageArticles.slice(0, 10);
};

export default bleskParser;
