import * as S3 from 'aws-sdk/clients/s3';
const s3 = new S3();
import * as fs from 'fs';

interface ObjectsReturn {
    Keys: string[],
    ContinuationToken: string | undefined;
}
(async () => {
    const getObjects = (ContinuationToken?: string) => new Promise<ObjectsReturn>((resolve, reject) => {
        const Bucket = "lidovky-headlines";
        s3.listObjectsV2({Bucket, ContinuationToken, Prefix: '2019052'}, (err, data) => {
            if(err) {
                reject(err);
            } else {
                const Keys: string[] = data.Contents!.map(f => f.Key!);
                resolve({Keys, ContinuationToken: data.NextContinuationToken});
            }
        });
    });
    const file = fs.createWriteStream(__dirname + '/../data/keys2.txt');
    let continuationToken: string | undefined = undefined;
    do {
        const objects: ObjectsReturn = await getObjects(continuationToken);
        continuationToken = objects.ContinuationToken;
        // const data = await s3.listObjectsV2({Bucket: "lidovky-headlines"}).promise();
        console.log(continuationToken);
        file.write(objects.Keys.join("\n") + "\n");
    } while (continuationToken !== undefined)
})();


