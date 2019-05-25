import {downloadObject} from "./utils";

exports.handler = async (env: any) => {
    try {
        const {file} = env.queryStringParameters as {file?: string};
        if(!file) {
            return {statusCode: 400}
        }
        const domain = getDomain(file);
        if(!domain) {
            return {statusCode: 400};
        }
        const html = (await downloadObject(file)).toString();
        // const replaced = html.replace(/"(\/[^"]*\.(css|js|svg)[^"]*)"/g, `"${domain}$1"`);
        const replaced = html.replace("<head>", `<head><base href='${domain}'>`);
        return {statusCode: 200, body: replaced, headers: {"Content-Type": "text/html"}};
    } catch(e) {
        return {statusCode: 400};
    }
};

const getDomain = (file: string) => {
    if(file.includes('novinky')) {
        return "https://www.novinky.cz"
    } else if (file.includes('irozhlas')) {
        return "https://www.irozhlas.cz";
    } else if (file.includes('denik-cz')) {
        return "https://www.denik.cz"
    } else {
        return null;
    }
}
