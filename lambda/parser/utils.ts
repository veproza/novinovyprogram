import * as S3 from 'aws-sdk/clients/s3';
import * as zlib from 'zlib';
import * as http from "http";
import * as https from "https";
import {IArticleData} from "./parsers/interfaces";
import {TitulkaResult} from "./parsers/alza";

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
    print?: TitulkaResult;
}

export interface HourData {
    time: number;
    articles: number[];
}



export const uploadObject = (Key: string, Body: Buffer, ContentType?: string, ContentEncoding?: string): Promise<void> => new Promise<void>((resolve, reject) => {
    resolve();
    // s3.putObject({Bucket, Key, Body, ContentType, ContentEncoding}, (err => {
    //     if(err) {
    //         reject(err);
    //     } else {
    //         resolve();
    //     }
    // }));
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

export const resetCurrentList = async (): Promise<void> => {
    return uploadObject("list.txt", Buffer.from(""));
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
