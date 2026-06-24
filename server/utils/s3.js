const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const isS3Configured = () => {
  const hasAws =
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET_NAME;
  const hasR2 =
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME;
  return Boolean(hasAws || hasR2);
};

let s3Client;

const getS3Client = () => {
  if (!s3Client) {
    if (!isS3Configured()) {
      throw new Error('S3/R2 is not configured');
    }

    const isR2 = Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID);
    s3Client = new S3Client({
      region: isR2 ? 'auto' : process.env.AWS_REGION || 'ap-south-1',
      ...(isR2 && {
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      }),
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID,
        secretAccessKey:
          process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
};

const getBucketName = () => process.env.S3_BUCKET_NAME || process.env.R2_BUCKET_NAME;

const uploadToS3 = async (buffer, key, mimeType) => {
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );
  return key;
};

const getSignedS3Url = async (key) => {
  const client = getS3Client();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    }),
    { expiresIn: 3600 }
  );
};

module.exports = {
  isS3Configured,
  uploadToS3,
  getSignedS3Url,
};
