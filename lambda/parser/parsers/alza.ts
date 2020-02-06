import {Publication} from "../index";
import * as request from 'request-promise';
import {parse} from "node-html-parser";

export type TitulkaResult = {
    img: string;
    link: string;
}

export const getTitulka = async (publication: Publication, date: Date): Promise<TitulkaResult|null> => {
    console.log(`Loading titulka ${publication}`);
    if(publication === 'denikn') {
        return findEnkoTitulka(date);
    }
    const html = await downloadPage(publication);
    if(!html) {
        return null;
    }
    return findTitulka(html, date);
};

const findEnkoTitulka = async (date: Date): Promise<TitulkaResult | null> => {
    const url = "https://noviny.denikn.cz/";
    const html = await request({url, gzip: true});
    const match = html.match(/<figure><img src="(.*?)" alt="(.*?)"><\/figure>/)!;
    if(match !== null) {
        const [_, src, alt] = match;
        const issue = src.split('/').pop();
        const ymd = alt.split(".").reverse().join('');
        const desiredYear = date.getFullYear().toString();
        const desiredMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        const desiredDate = date.getDate().toString().padStart(2, '0');
        if (ymd === desiredYear + desiredMonth + desiredDate) {
            return ({
                img: src,
                link: `https://noviny.denikn.cz/denikn/issues/${issue}`
            });
        }
    }
    return null;
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
    const headers = {
        'accept-language': 'cs,en-US;q=0.9,en;q=0.8,sk;q=0.7',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        'x-contact': 'marcel@sulek.cz // +420777603288 // novinovyprogram.cz',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'cookie': '_ga=GA1.1.1151472783.1581024262; VZTX=2094961091; _gcl_au=1.1.94503966.1581024264; __ssds=2; _ga_FGLGFS7LP0=GS1.1.1581024262.1.1.1581024264.58; __ssuzjsr2=a9be0cd8e; __uzmaj2=5064d36d-0bf3-4c64-bfd1-7b6618b89244; __uzmbj2=1581024262; __uzmcj2=402331077365; __uzmdj2=1581024262'
    };
    return await request({url, gzip: true, headers});
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
        case "denik":
            return "https://www.alza.cz/media/prazsky-denik-d4721295.htm";
        case "blesk":
            return "https://www.alza.cz/media/blesk-d5628082.htm";
        case "e15":
            return "https://www.alza.cz/media/e15-d5631492.htm";
        default:
            return null;
    }
};
