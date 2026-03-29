import { S3Client } from "@aws-sdk/client-s3";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { serverEnv } from "@/lib/env/server";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${serverEnv.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: serverEnv.R2_ACCESS_KEY_ID,
    secretAccessKey: serverEnv.R2_SECRET_ACCESS_KEY,
  },
});

export async function getR2Object(key: string) {
  const command = new GetObjectCommand({
    Bucket: serverEnv.R2_BUCKET_NAME,
    Key: key,
  });
  return r2Client.send(command);
}

export async function deleteR2Object(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: serverEnv.R2_BUCKET_NAME,
    Key: key,
  });
  await r2Client.send(command);
}

export async function putR2Object(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: serverEnv.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export { r2Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand };
