import {parse} from 'url';
import * as request from 'request';
import * as iconv from "iconv-lite";
const allowedDomains = [
    ['cz', 'idnes'],
    ['cz', 'lidovky'],
    ['cz', 'aktualne'],
    ['cz', 'irozhlas'],
    ['cz', 'novinky'],
    ['cz', 'ihned'],
    ['cz', 'denik'],
    ['cz', 'denikn'],
    ['cz', 'seznamzpravy']
];
exports.handler = async (env: any) => {
    try {
        let {url} = env.queryStringParameters as {url?: string};

        console.log("Request for ", url);
        if(!url) {
            return {statusCode: 400}
        }
        if(url.startsWith('//')) {
            url = 'https:' + url;
        }
        const parsed = parse(url);

        if(!checkDomain(parsed.host)) {
            console.log(`not allowed host ${parsed.host}`);
            return {statusCode: 405, body: `not allowed host ${parsed.host}, ${JSON.stringify(parsed)}, ${url}`};
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
const checkDomain = (domainToCheck?: string): boolean => {
    if (!domainToCheck) {
        return false;
    }
    const checkedLevels = domainToCheck.split('.').reverse();
    return allowedDomains.some((allowedDomain) => {
        for (var i in allowedDomain) {
            if (checkedLevels[i] !== allowedDomain[i]) {
                return false;
            }
        }
        return true;
    })
};
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
