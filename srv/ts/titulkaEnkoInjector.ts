import {Publication, PublicationDay} from "./parser";
import * as fs from 'fs';
import {downloadObject, uploadObject} from "./utils";
import {IArticleData} from "./parsers/interfaces";
import {TitulkaResult} from "./titulkaInjector";

const html = fs.readFileSync(__dirname + "/../data/denikn.htm", 'utf-8');
const images = html.match(/<figure><img src="(.*?)" alt="(.*?)"><\/figure>/g)!;
// images.length = 20;
const download = async (filename: string): Promise<PublicationDay> => {
    try {
        return JSON.parse((await downloadObject(filename)).toString()) as PublicationDay
    } catch (e) {
        return {
            articles: [],
            hours: []
        }
    }
};

images.forEach(async (image) => {
    const [_, src, alt] = image.match(/<figure><img src="(.*?)" alt="(.*?)"><\/figure>/)!;
    const issue = src.split('/').pop();
    const ymd = alt.split(".").reverse().join('');
    const filename = `daypub-${ymd}-denikn.json`;
    let json = await download(filename);
    json.print = {
        img: src,
        link: `https://noviny.denikn.cz/denikn/issues/${issue}`
    };
    // fs.writeFileSync(__dirname + "/../data/" + filename, JSON.stringify(json));
    uploadObject(filename, json);
});
