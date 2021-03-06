import * as S3 from 'aws-sdk/clients/s3';
import * as zlib from 'zlib';
import * as http from "http";
import * as https from "https";

const s3 = new S3();

const Bucket = "lidovky-headlines";
http.globalAgent.maxSockets = 100;
https.globalAgent.maxSockets = 100;
export const downloadObject = (Key: string): Promise<Buffer> => new Promise<Buffer>((resolve, reject) => {
    s3.getObject({Bucket, Key}, (err, response) => {
        if(err) {
            reject(err);
        } else {
            const body = response.Body;
            zlib.gunzip(body as Buffer, (err, unzipped) => {
                if(err) {
                    reject(err);
                } else {
                    process.stdout.write('.');
                    resolve(unzipped);
                }
            });
        }
    })
});


export interface DailyResult {
    lastFileTime: number,
    publications: {
        idnes: PublicationDay;
        lidovky: PublicationDay;
        aktualne: PublicationDay;
        irozhlas: PublicationDay;
        novinky: PublicationDay;
        ihned: PublicationDay;
    }
}

export interface PublicationDay {
    articles: IArticleData[];
    hours: HourData[];
    print?: TitulkaResult | null;
}

export interface HourData {
    time: number;
    articles: number[];
}

export const downloadUrl = (url: string): Promise<string> => new Promise((resolve, reject) => {
    https.get(url, res => {
        let data = '';
        res.on("data", chunk => {
            data += chunk;
        });
        res.on('error', reject);
        res.on('end', () => {
            resolve(data);
        })
    });
});

export const uploadFile = (Key: string, Body: Buffer, ContentType?: string, ContentEncoding?: string): Promise<void> => new Promise<void>((resolve, reject) => {
    s3.putObject({Bucket, Key, Body, ContentType, ContentEncoding}, (err => {
        if(err) {
            reject(err);
        } else {
            resolve();
        }
    }));
});

export const deleteFile = (Key: string) => new Promise((resolve, reject) => {
    s3.deleteObject({Bucket, Key}, (err, data) => err ? reject(err) : resolve(data));
});

export const gzip = (data: Buffer): Promise<Buffer> => new Promise((resolve, reject) => {
    zlib.gzip(data, (error, compressed) => error ? reject(error) : resolve(compressed));
});


export const gunzip = (data: Buffer): Promise<Buffer> => new Promise((resolve, reject) => {
    zlib.gunzip(data, (error, compressed) => error ? reject(error) : resolve(compressed));
});

export const getObject = (Key: string): Promise<Buffer> => new Promise((resolve, reject) => {
    s3.getObject({Bucket, Key}, (err, response) => {
        if(err) {
            reject(err);
        } else {
            resolve(response.Body as Buffer);
        }
    })
});

export const getCurrentList = async (): Promise<FileAndDate[]> => {
    const textList = (await getObject("list.txt")).toString();
    return textList
        .split("\n")
        .filter(i => i.length)
        .map(fileToFileAndDate);
};

export const setCurrentList = async (remainingList: string): Promise<void> => {
    return uploadFile("list.txt", Buffer.from(remainingList));
};

export type FileAndDate = {
    filename: string;
    date: Date;
    time: number;
}

const getDateFromFileName = (filename: string): Date => {
    try {
        if (filename.startsWith('20')) {
            // 20190517T130127_ihned-cz.html
            //2019-05-20T12:29:25.476Z
            const date = filename.split("_")[0];
            const isoDate = date.substr(0, 4) + '-' + date.substr(4, 2) + '-' + date.substr(6, 2);
            const isoTime = date.substr(9, 2) + ':' + date.substr(11, 2) + ':' + date.substr(13, 2);
            const isoDateTime = isoDate + 'T' + isoTime + '.000Z';
            return new Date(isoDateTime);
        } else {
            // aktualne-cz_1529537487974.html
            const time = filename.split('_')[1].split('.')[0];
            const d = new Date();
            d.setTime(parseInt(time, 10));
            return d;
        }
    } catch (e) {
        throw new Error("Unparsable: " + filename);
    }
};

export const fileToFileAndDate = (filename: string): FileAndDate => {
    const date = getDateFromFileName(filename);
    const time = date.getTime();
    return ({
        filename,
        date,
        time
    });
};

export interface IArticleData {
    headline: string;
    perex: string;
    link: string;
}

export interface IParser {
    (file: string): Promise<IArticleData[]>
}

export type TitulkaResult = {
    img: string;
    link: string;
}
