import {downloadObject} from "./utils";

exports.handler = async (env: any) => {
    try {
        const {file} = env.queryStringParameters as {file?: string};
        if(!file) {
            return {statusCode: 400}
        }
        if(!(file.includes('novinky') || file.includes('irozhlas'))) {
            return {statusCode: 400}
        }
        const html = (await downloadObject(file)).toString();
        const domain = file.includes('novinky')
            ? 'https://www.novinky.cz'
            : 'https://www.irozhlas.cz';
        // const replaced = html.replace(/"(\/[^"]*\.(css|js|svg)[^"]*)"/g, `"${domain}$1"`);
        const replaced = html.replace("<head>", `<head><base href='${domain}'>`);
        return {statusCode: 200, body: replaced, headers: {"Content-Type": "text/html"}};
    } catch(e) {
        return {statusCode: 400};
    }
};
