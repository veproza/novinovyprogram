import {IArticleData, IParser} from "./interfaces";
import {downloadObject} from "../utils";

const seznamzpravyParser: IParser = async (file) => {
    const content = await downloadObject(file);
    const [pre, main] = content.toString().split("hpSetInitData(");
    const [json, post] = main.split(")</script>");
    const data = JSON.parse(json);
    return data.initialData.gadgets.gadgetRss.feeds[163425].data.items.map((item: any): IArticleData => {
        return {
            link: item.url.split("?")[0],
            perex: item.perex,
            headline: item.title
        }
    });
};

export default seznamzpravyParser;
