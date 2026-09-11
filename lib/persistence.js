import fs from "fs/promises";
import path from "path";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const S3_KEY = "shortlists.json";

const filePath = path.join(process.cwd(), "data", "shortlists.json");

function useS3() {
  return Boolean(process.env.SHORTLIST_S3_BUCKET);
}

async function readFileStore() {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeFileStore(data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

function s3Client() {
  return new S3Client({
    region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-south-1",
  });
}

async function readS3Store() {
  const bucket = process.env.SHORTLIST_S3_BUCKET;
  try {
    const res = await s3Client().send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: S3_KEY,
      })
    );
    const raw = await res.Body.transformToString();
    return JSON.parse(raw);
  } catch (err) {
    const code = err.name || err.Code;
    if (code === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) return {};
    throw err;
  }
}

async function writeS3Store(data) {
  const bucket = process.env.SHORTLIST_S3_BUCKET;
  await s3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: S3_KEY,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json",
    })
  );
}

export async function readAllRecords() {
  if (useS3()) return readS3Store();
  return readFileStore();
}

export async function writeAllRecords(data) {
  if (useS3()) return writeS3Store(data);
  return writeFileStore(data);
}
