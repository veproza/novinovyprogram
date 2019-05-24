import {Publication} from "../index";
import * as request from 'request-promise';
import {parse} from "node-html-parser";

export type TitulkaResult = {
    img: string;
    link: string;
}

export const getTitulka = async (publication: Publication, date: Date): Promise<TitulkaResult|null> => {
    console.log(`Loading titulka ${publication}`);
    const html = await downloadPage(publication);
    if(!html) {
        return null;
    }
    return findTitulka(html, date);
};

const findTitulka = async (html: string, date: Date): Promise<TitulkaResult | null> => {
    const root = parse(html);
    const issues = (root as any).querySelectorAll('.issue');
    const desiredYear = date.getFullYear().toString();
    const desiredMonth = (date.getMonth() + 1).toString();
    const desiredDate = date.getDate().toString().padStart(2, '0');
    const splitterRegex = /[-\\.]/;
    const issue = issues.find((issue: any) => {
        const issueDate = issue.querySelector('.name').rawText;
        if(issue.attributes['data-year'] !== desiredYear) {
            return false;
        }
        if(issue.attributes['data-month'] !== desiredMonth) {
            return false;
        }
        const [dayOrYear1, month, dayOrYear2] = issueDate.split(splitterRegex);
        return dayOrYear1 === desiredDate || dayOrYear2 === desiredDate;
    });
    if(issue) {
        const img = issue.querySelector('img').attributes.src;
        const link = "https://www.alza.cz" + issue.querySelector('a').attributes.href;
        return ({img, link});
    } else {
        return null;
    }
};

const downloadPage = async (publication: Publication): Promise<string | null> => {
    const url = getAddressForPublication(publication);
    if (!url) {
        return null;
    }
    return await request({url, gzip: true});
};

const getAddressForPublication = (publication: Publication): string | null => {
    switch (publication) {
        case "idnes":
            return "https://www.alza.cz/media/mf-dnes-d2172048.htm";
        case "lidovky":
            return "https://www.alza.cz/media/lidove-noviny-d2172049.htm";
        case "novinky":
            return "https://www.alza.cz/media/pravo-d2172145.htm";
        case "ihned":
            return "https://www.alza.cz/media/hospodarske-noviny-d2172555.htm";
        default:
            return null;
    }
};
