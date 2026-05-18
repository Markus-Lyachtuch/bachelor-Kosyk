import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import config from "../config/index";
import { DEFAULT_S3_IMAGE_NAME } from "../const/s3";
import { MulterRequest } from "../types/common";
import sharp from "sharp";

const defaultFolderName = "sets";
const region = config.awsRegion;
const bucketName = config.awsS3BucketName;

export const s3Client = new S3Client({ region });

export const getS3PublicUrl = (folder: string = defaultFolderName) =>
  `https://${bucketName}.s3.${region}.amazonaws.com/${folder}`;

export async function uploadToStorageAndGetUrl(
  file: MulterRequest["file"],
  folderName: string = defaultFolderName,
): Promise<string> {
  const fileExt = file.originalname ? file.originalname.split(".").pop() : file.name.split(".").pop();
  const key = `${folderName}/${randomUUID()}.${fileExt ?? "bin"}`;

  const webpBuffer = await sharp(file.buffer).webp({ quality: 90 }).toBuffer();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: webpBuffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  const publicUrl = `${getS3PublicUrl(folderName)}/${key.slice(folderName.length + 1)}`;
  return publicUrl;
}

export async function deleteFromStorageByUrl(url: string): Promise<void> {
  if (url.includes(DEFAULT_S3_IMAGE_NAME)) return;

  const urlObj = new URL(url);
  const key = urlObj.pathname.replace(/^\/+/, "");

  if (!key) {
    throw new Error("Cannot extract S3 key from URL");
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
}
