import {parse} from 'url';
import * as request from 'request';
import * as iconv from "iconv-lite";

exports.handler = async (env: any) => {
    try {
        const {url} = env.queryStringParameters as {url?: string};
        console.log("Request for ", url);
        if(!url) {
            return {statusCode: 400}
        }
        const parsed = parse(url);
        const allowedDomains = [
            'www.idnes.cz',
            'www.lidovky.cz',
            'www.aktualne.cz',
            'www.irozhlas.cz',
            'www.novinky.cz',
            'ihned.cz',
            'www.denik.cz',
            'www.denikn.cz',
            'www.seznamzpravy.cz'
        ];
        if(!allowedDomains.includes(parsed.host || '')) {
            console.log(`not allowed host ${parsed.host}`);
            return {statusCode: 405};
        }

        const response = await makeRequest(url);
        const body = response.headers["Content-Type"] && response.headers["Content-Type"].includes('1250')
            ? iconv.decode(response.body, 'cp1250')
            : response.body.toString();
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/html'
        };
        return {statusCode: 200, body, headers};
    } catch(e) {
        return {statusCode: 400};
    }
};
type Response = {
    body: Buffer;
    headers: {
        "Content-Type"?: string;
    }
}
const makeRequest = (url: string): Promise<Response> => {
    return new Promise<Response>((resolve, reject) => {
        request({url, encoding: null, gzip: true}, (err, res, body) => {
            if(err) {
                reject(err);
            } else {
                resolve({
                    body: body,
                    headers: {
                        "Content-Type": res.headers["content-type"]
                    }
                });
            }
        });
    })
};
