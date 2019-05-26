import * as S3 from 'aws-sdk/clients/s3';
import * as zlib from 'zlib';
import {DailyResult, PublicationDay} from "./parser";
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


export const uploadObject = async (Key: string, content: PublicationDay): Promise<void> => {

    const json = Buffer.from(JSON.stringify(content));
    const compressed = await gzip(json);
    return uploadFile(Key, compressed, "application/json", "gzip");
};

export const uploadFile = (Key: string, Body: Buffer, ContentType?: string, ContentEncoding?: string): Promise<void> => new Promise((resolve, reject) => {
    s3.putObject({Bucket, Key, Body, ContentType, ContentEncoding}, (err => {
        if(err) {
            reject(err);
        } else {
            resolve();
        }
    }));
});

export const gzip = (data: Buffer): Promise<Buffer> => new Promise((resolve, reject) => {
    zlib.gzip(data, (error, compressed) => error ? reject(error) : resolve(compressed));
});


export const gunzip = (data: Buffer): Promise<Buffer> => new Promise((resolve, reject) => {
    zlib.gunzip(data, (error, compressed) => error ? reject(error) : resolve(compressed));
});
