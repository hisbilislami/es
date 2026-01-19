import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import cuid2 from "@paralleldrive/cuid2";
import mime from "mime-types";

import { env } from "./env.server";

const {
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_DEFAULT_REGION,
  S3_BUCKET,
  S3_API_HOST,
} = env();

if (
  !(
    S3_ACCESS_KEY_ID &&
    S3_SECRET_ACCESS_KEY &&
    S3_DEFAULT_REGION &&
    S3_BUCKET &&
    S3_API_HOST
  )
) {
  throw new Error(`S3 Storage is missing required configuration.`);
}

const s3 = new S3Client({
  endpoint: S3_API_HOST,
  region: S3_DEFAULT_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID!,
    secretAccessKey: S3_SECRET_ACCESS_KEY!,
  },
});

export enum UploadType {
  ARCHIVE = "Archive",
  IMAGE = "Image",
}

const mimetypeList = [
  "application/pdf",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
];

export async function storeFile(
  // pathDir: string | null | undefined,
  file: File,
  type: UploadType,
  tenantId: string,
  userId: string,
  // delete_old_file?: string,
) {
  const mimetype = mime.lookup(file.name);
  const ext = mime.extension(file.type) || "bin";
  if (!mimetype || !ext) throw new Error(`cannot read file`);
  if (type === UploadType.IMAGE && !mimetype.includes("image/")) {
    throw new Error(`file is not images`);
  }

  if (type === UploadType.ARCHIVE && !mimetypeList.includes(mimetype)) {
    throw new Error(`files do not include pdf, doc, ppt, or xls`);
  }

  // ------------ throw errors end ----------------------

  const buffers = Buffer.from(await file.arrayBuffer());
  const fileNameWithoutExt = cuid2.createId();
  const storedFileName = `${fileNameWithoutExt}-${tenantId}-${userId}.${ext}`;
  let returnnewFilename = storedFileName;

  returnnewFilename = S3_BUCKET
    ? `${S3_BUCKET}/${returnnewFilename}`
    : returnnewFilename;
  returnnewFilename = await uploadToS3(buffers, returnnewFilename, mimetype);
  // const keyName =
  //   delete_old_file && delete_old_file.split("/")[0] === "s3"
  //     ? delete_old_file.split("/").slice(1).join("/")
  //     : null;
  // if (keyName) await deleteObjectIfExistsOnS3(keyName);

  return { filename: returnnewFilename };
}

export async function uploadToS3(
  file: Buffer,
  key: string,
  // userId: string,
  // tenantId: string,
  // fileGroup: "photo_profile" | "ktp" | "npwp",
  mimeType: string,
): Promise<string> {
  // const fileExt = mime.extension(file.type) || "bin";
  // const timestamp = formatDate(new Date(), "YYYYMMDDHHmmss");
  // const fileName = `${timestamp}-esign-${userId}-${tenantId}-${fileGroup}.${fileExt}`;

  const uploadParams = new PutObjectCommand({
    Bucket: S3_BUCKET!,
    Key: key,
    Body: file,
    ContentType: mimeType,
  });

  await checkAndCreateBucketOnS3(s3, S3_BUCKET);

  await s3.send(uploadParams);

  const url = `s3/${key}`;
  console.log("Success uploading file to S3.");
  return url;
}

async function checkAndCreateBucketOnS3(s3: S3Client, bucketName: string) {
  const params = {
    Bucket: bucketName,
  };

  try {
    const headCommand = new HeadBucketCommand(params);
    await s3.send(headCommand);
    console.log("Bucket exists:", bucketName);
    return true;
  } catch (error) {
    if (error.name === "NotFound") {
      console.log("Bucket does not exist. Creating bucket:", bucketName);
      try {
        const createCommand = new CreateBucketCommand(params);
        await s3.send(createCommand);
        console.log("Bucket created successfully:", bucketName);
        return true;
      } catch (createError) {
        console.error("Error creating bucket:", createError);
        return false;
      }
    }
    console.error("Error checking bucket existence:", error);
    throw error;
  }
}

export const pathKeyToUrl = async (
  pathKey: string,
  expiredTime: number,
): Promise<string> => {
  let url = "";
  const paramsGet = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: pathKey.split("/").slice(1).join("/"),
  });
  url = await getSignedUrl(s3, paramsGet, { expiresIn: expiredTime });
  return url;
};
