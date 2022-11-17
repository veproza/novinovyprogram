const ignoreExtensions = ['map'];
const gzippable = ['css', 'js', 'html', 'svg'];
import {promises as fs} from 'fs';
import * as mime from 'mime';
import * as zopfli from 'zlib';
import {S3, CloudFront} from 'aws-sdk';

const uploadDir = async (dir: string, prefix: string) => {
    console.log(`uploading dir ${dir}`);
    const files = await fs.readdir(dir);
    await files.map(async (file) => {
        const filePath = dir + "/" + file;
        const stat = await fs.stat(filePath);
        if(stat.isDirectory()) {
            return uploadDir(dir + "/" + file, prefix + "/" + file);
        } else {
            return uploadFile(dir, prefix, file)
        }
    })
};
const uploadFile = async (sourcePath: string, destinationPath: string, name: string) => {
    const extension = name.split('.').pop()!;
    if(ignoreExtensions.includes(extension)) {
        return;
    }
    const sourceAddress = `${sourcePath}/${name}`;
    const destinationAddress = `${destinationPath}/${name}`.substr(1);
    const content = await getContent(sourceAddress);
    console.log(`upload file ${sourcePath}/${name} to ${destinationAddress} as ${content.ContentType}`);
    await uploadObject(destinationAddress, content.Body, content.ContentType || undefined, content.ContentEncoding);
};

const getContent = async (path: string) => {
    const extension = path.split('.').pop()!;
    const isGzippable = gzippable.includes(extension);
    const ContentType = mime.getType(path);
    const content = await fs.readFile(path);
    const Body = isGzippable ? await gzip(content) : content;
    const ContentEncoding = isGzippable ? "gzip" : undefined;
    return {ContentType, ContentEncoding, Body};

};

const gzip = (input: Buffer) => new Promise<Buffer>((resolve, reject) => {
    (zopfli as any).gzip(input, (err: any, gzipped: Buffer) => {
        err ? reject(err) : resolve(gzipped);
    })
});

const s3 = new S3();
const Bucket = 'lidovky-headlines';

export const uploadObject = (Key: string, Body: Buffer, ContentType?: string, ContentEncoding?: string): Promise<void> => new Promise<void>((resolve, reject) => {
    s3.putObject({Bucket, Key, Body, ContentType, ContentEncoding}, (err => {
        if(err) {
            reject(err);
        } else {
            resolve();
        }
    }));
});

const baseDir =  __dirname + "/../client/public";
uploadDir(baseDir, "");

const cloudFront = new CloudFront();
cloudFront.createInvalidation({
    DistributionId: 'E1TEBGC7C64C8G',
    InvalidationBatch: {
        CallerReference: new Date().toISOString().substr(0, 16),
        Paths: {
            Quantity: 1,
            Items: ["/*"]
        }
    }
}, (err, data) => err ? console.error(err) : console.log(data));
