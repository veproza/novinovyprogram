import * as S3 from 'aws-sdk/clients/s3';
import * as zlib from 'zlib';

const s3 = new S3();

const Bucket = "lidovky-headlines";

export const downloadObject = (Key: string): Promise<Buffer> => new Promise<Buffer>((resolve, reject) => {

    s3.getObject({Bucket, Key}, (err, response) => {
        if(err) {
            reject(err);
        } else {
            const body = response.Body;
            const gunzip = zlib.gunzip(body as Buffer, (err, unzipped) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(unzipped);
                }
            });
        }
    })
});
