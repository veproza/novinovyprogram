import {Publication, PublicationDay} from "./parser";
import * as fs from 'fs';
import {parse} from "node-html-parser";
import {downloadObject, uploadObject} from "./utils";
import * as request from "request-promise";

export type TitulkaResult = {
    img: string;
    link: string;
}


export const getTitulka = async (publication: Publication): Promise<Map<string, TitulkaResult>> => {
    const html = await downloadPage(publication);
    return findTitulka(html!);
};

const findTitulka = (html: string): Map<string, TitulkaResult> => {
    const root = parse(html);
    const issues = (root as any).querySelectorAll('.issue');
    const splitterRegex = /[-_\\.]/;
    const outMap: Map<string, TitulkaResult> = new Map();
    console.log(issues.length, html.length);
    issues.forEach((issue: any) => {
        const issueDate = issue.querySelector('.name').rawText;
        const [dayOrYear1, month, dayOrYear2] = issueDate.split(splitterRegex);
        if(!dayOrYear2) {
            console.log(issueDate);
        }
        const [day, year] = dayOrYear2.length === 4
            ? [dayOrYear1, dayOrYear2]
            : [dayOrYear2, dayOrYear1];
        const dayId = year + month + day;
        const img = issue.querySelector('img').attributes.src;
        const link = "https://www.alza.cz/" + issue.querySelector('a').attributes.href;
        const titulka: TitulkaResult = ({img, link});
        outMap.set(dayId, titulka);
    });
    return outMap;
};

const downloadPage = async (publication: Publication): Promise<string | null> => {
    return await request({url: "https://www.alza.cz/media/prazsky-denik-29-05-2019-d5616715.htm", gzip: true});
    // return fs.readFileSync(__dirname + "/../data/" + publication + ".htm", 'utf-8');
};


(async () => {
    const maps: Map<string, Map<string, TitulkaResult>> = new Map();
    const printPublications: Publication[] = ['denik'];
    await Promise.all(printPublications.map(async (publication) => {
        const map = await getTitulka(publication);
        maps.set(publication, map);
    }));
    const minDay = 20190528;
    const days = Array.from(maps.get(printPublications[0])!.keys())
        .filter(d => parseInt(d, 10) > minDay);
    console.log(days);
    days.forEach(async (day) => {
        try {
            printPublications.forEach(async(publication) => {
                const filename = `daypub-${day}-${publication}.json`;
                const json = JSON.parse((await downloadObject(filename)).toString()) as PublicationDay;
                if (json.print === undefined || true) {
                    json.print = maps.get(publication)!.get(day);
                    await uploadObject(filename, json);
                }
            });
        } catch (e) {
            console.error('Fuck', day, e);
        }
    });

})();
