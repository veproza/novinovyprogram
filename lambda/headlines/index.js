"use strict";
const request = require("request");
const aws = require('aws-sdk');
const zlib = require('zlib');
const s3 = new aws.S3();
const sites = [
    "https://www.idnes.cz/",
    "https://www.lidovky.cz/",
    "https://www.novinky.cz/",
    "https://www.aktualne.cz/",
    "https://ihned.cz/",
    "https://www.irozhlas.cz/",
    "https://denikn.cz/",
    "https://www.denik.cz/",
    "https://www.bbc.com/",
    "https://www.lemonde.fr/",
    "http://wyborcza.pl/",
    "https://www.spiegel.de/",
    "https://www.ft.com/"
];
const bucket = "lidovky-headlines";

const process = (url) => {
    const id = toId(url);
    return download(url)
        .then(compress)
        .then((content) => upload(id, content))
}

const toId = (url) => {
    return url.split("/")[2]
        .replace("www.", "")
        .replace(/[^a-zA-Z0-9]/g, '-');
}

const download = (url) => new Promise((resolve, reject) => {
    request.get({url: url, gzip: true, encoding: null}, (err, res, body) => {
        resolve(body);
    });
});

const compress = (content) => new Promise((resolve, reject) => {
    zlib.gzip(content, {}, function(err, compressed) {
        resolve(compressed);
    });
});

const upload = (id, content) => {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').substr(0,15);
    const filename = timestamp + "_" + id + ".html";
    return putToBucket({
        Bucket: bucket,
        Key: filename,
        Body: content,
        ContentType: "text/html",
        ContentEncoding: "gzip"
    });
}

const putToBucket = (bucketOrParams, key, data) => new Promise((resolve, reject) => {
    let params = {};
    if(bucketOrParams instanceof Object) {
        params = bucketOrParams;
    } else {
        params = {
            Body: Buffer.from(data),
            Bucket: bucketOrParams,
            Key: key.toString()
        }
    }
    return s3.putObject(params, (err, response) => err ? reject(err) : resolve(params.Key));
});
const getFromBucket = (Bucket, Key) => new Promise((resolve, reject) => {
    s3.getObject({Bucket, Key}, (err, response) => {
        if(err) {
            reject(err);
        } else {
            resolve(response.Body);
        }
    })
});

const appendToFile = async (Bucket, Key, appendage) => {
    const existing = await getFromBucket(Bucket, Key);
    const joined = Buffer.concat([existing, Buffer.from(appendage)]);
    await putToBucket(Bucket, Key, joined);

};

exports.handler = async (event, context, callback) => {
    // const ids = await Promise.all(sites.map(process));
    // const idList = ids.join("\n") + "\n";
    // await appendToFile(bucket, "list.txt", idList);
    const d = await getFromBucket(bucket, "list.txt");
    console.log(d.toString());
};
