const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: "eu-north-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function listBuckets() {
  try {
    const command = new ListBucketsCommand({});
    const { Buckets } = await s3Client.send(command);
    console.log("Success", Buckets);
  } catch (err) {
    console.log("Error", err);
  }
}

listBuckets();