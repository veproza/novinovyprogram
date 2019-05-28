import {IArticleData, IParser} from "./interfaces";
import {downloadObject} from "../utils";

const seznamzpravyParser: IParser = async (file) => {
    const content = await downloadObject(file);
    const [pre, main] = content.toString().split("initialReduxStoreState\":");
    const [json, post] = main.split("\n       ");
    const parsable = json.substr(0, json.length - 1);
    const data = JSON.parse(parsable);
    return data.gadgets.gadgetRss.feeds[163425].data.items.map((item: any): IArticleData => {
        return {
            link: item.url,
            perex: item.perex,
            headline: item.title
        }
    });
};

export default seznamzpravyParser;
