import * as S3 from 'aws-sdk/clients/s3';
import * as zlib from 'zlib';
import {DailyResult} from "./parser";
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


export const uploadObject = (Key: string, content: DailyResult): Promise<void> => new Promise<void>((resolve, reject) => {
    const json = Buffer.from(JSON.stringify(content));
    zlib.gzip(json, (error, compressed) => {
        if(error) {
            reject(error);
            return;
        }
        s3.putObject({Bucket, Key, Body: compressed, ContentType: "application/json", ContentEncoding: "gzip"}, (err => {
            if(err) {
                reject(err);
            } else {
                resolve();
            }
        }));
    });

});

export const gzip = (data: Buffer): Promise<Buffer> => new Promise((resolve, reject) => {
    zlib.gzip(data, (error, compressed) => error ? reject(error) : resolve(compressed));
});


export const gunzip = (data: Buffer): Promise<Buffer> => new Promise((resolve, reject) => {
    zlib.gunzip(data, (error, compressed) => error ? reject(error) : resolve(compressed));
});
