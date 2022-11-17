import {IArticleData, IParser} from "./interfaces";
import {downloadObject, getDateFromFileName} from "../utils";
import {parse} from "node-html-parser";

const novinkyParser: IParser = async (file) => {
    const time = getDateFromFileName(file);
    if (time.getTime() >= 1565129791000) { // 20190806T221631
        return novinkyParser20190806(file);
    } else {
        return novinkyParserOlder(file);
    }
}

const novinkyParser20190806: IParser = async (file) => {
    const content = await downloadObject(file);
    const root = parse(content.toString());
    const time = getDateFromFileName(file);
    if (time.getTime() > 1661216400000) {
        const elements = (root as any).querySelectorAll("[data-dot='ogm-top-stories'] article");
        const valid = elements
            .map((e: any): IArticleData | null => {
                const headlineElement = e.querySelector('h3');
                if (!headlineElement) {
                    return null;
                }
                const linkElement = e.querySelector('a');
                if (!linkElement || !linkElement.attributes) {
                    return null;
                }
                const headline = headlineElement.rawText.trim();
                const perexElement = e.querySelector('span');
                const perex = perexElement ? perexElement.rawText.trim() : '';
                const link = linkElement.attributes.href;
                return {headline, perex, link};
            })
            .slice(0, 10);
        return (valid.filter((i: IArticleData | null) => i !== null) as IArticleData[]);
    } else {
        const elements = (root as any).querySelectorAll('main header li');
        const valid = elements
            .map((e: any): IArticleData | null => {
                const headlineElement = e.querySelector('h3');
                if (!headlineElement) {
                    return null;
                }
                const linkElement = e.querySelector('a');
                if (!linkElement || !linkElement.attributes) {
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
    }
};


const novinkyParserOlder: IParser = async (file) => {
    const content = await downloadObject(file);
    const root = parse(content.toString());

    const elements = [((root as any).querySelector('.topArticle')), ...((root as any).querySelectorAll('.taItem'))];
    const valid = elements
        .map((e: any): IArticleData | null => {
            const headlineElement = e.querySelector('h2') || e.querySelector('h3');
            if(!headlineElement) {
                return null;
            }
            const linkElement = headlineElement.querySelector('a');
            if(!linkElement || !linkElement.attributes) {
                return null;
            }
            const headline = linkElement.rawText.trim();
            const perexElement = e.querySelector('.info p') || e.querySelector('p');
            const perex = perexElement ? perexElement.rawText.trim() : '';
            const link = linkElement.attributes.href;
            return {headline, perex, link};
        })
        .slice(0, 10);
    return (valid.filter((i: IArticleData | null) => i !== null) as IArticleData[]);
};

// (async () => {
//     // console.log(await novinkyParser("20190806T220128_novinky-cz.html"));
//     // console.log(await novinkyParser("20190806T221631_novinky-cz.html"));
// })();

export default novinkyParser;
