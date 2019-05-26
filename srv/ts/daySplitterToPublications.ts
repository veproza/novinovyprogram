import {downloadObject, gzip, uploadFile, uploadObject} from "./utils";
import {DailyResult} from "./parser";
import * as fs from 'fs';

(async () => {
    const days = fs.readFileSync(__dirname + "/../data/keys2.txt", 'utf8')
        .split("\n")
        .filter(f => f && f.length === 17)
        .map(d => d.substr(4, 8));
    Promise.all(days.map(async (day: string) => {
        console.log(day);
        const data = JSON.parse((await downloadObject(`day-${day}.json`)).toString()) as DailyResult;
        await Promise.all(Object.keys(data.publications).map(async (publicationId) => {
            const pub = data.publications[publicationId];
            const json = JSON.stringify(pub);
            const gzipped = await gzip(Buffer.from(json));
            const key = `daypub-${day}-${publicationId}.json`;
            await uploadFile(key, gzipped, "application/json", "gzip");
        }));
    }));
})();
