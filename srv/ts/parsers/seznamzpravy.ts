import {IArticleData, IParser} from "./interfaces";
import {downloadObject, getDateFromFileName} from "../utils";

const seznamzpravyParser: IParser = async (file) => {
    const time = getDateFromFileName(file);
    if (time.getTime() > 1563356100000) { // 20190717T093131
        return seznamZpravyParser20190717(file);
    } else {
        return seznamZpravyOlder(file);
    }
};

const seznamZpravyParser20190717: IParser = async (file) => {
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
}


const seznamZpravyOlder: IParser = async (file) => {
    const content = await downloadObject(file);
    const [pre, main] = content.toString().split("initialReduxStoreState\":");
    const [json, post] = main.split("\n       ");
    const parsable = json.substr(0, json.length - 1);
    const data = JSON.parse(parsable);
    return data.gadgets.gadgetRss.feeds[163425].data.items.map((item: any): IArticleData => {
        return {
            link: item.url.split("?")[0],
            perex: item.perex,
            headline: item.title
        }
    });
}

// (async () => {
//     console.log(await seznamzpravyParser("20190717T093131_seznam-cz.html"));;
// })();

export default seznamzpravyParser;
