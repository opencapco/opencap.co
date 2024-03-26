import {
  getPresignedGetUrl,
  getPresignedPutUrl,
  type getPresignedUrlOptions,
} from "@/server/file-uploads";
import { generatePublicId } from "./id";
/**
 * usage
 * ```js
 * import { uploadFile } from '@/common/uploads'
 *
 * const handleUpload = async (file: File) => {
 *   const { uploadKey } = await uploadFile(file);
 *
 *   // save to the database
 *   saveDB({ uploadKey });
 * };
 * ```
 */

export const uploadFile = async (
  file: File | Buffer,
  options: Pick<
    getPresignedUrlOptions,
    "expiresIn" | "keyPrefix" | "identifier"
  >,
  bucketMode: "publicBucket" | "privateBucket" = "privateBucket",
) => {
  const isFile = file instanceof File;
  let fileType: string;
  let fileName: string;
  let fileSize: number;

  if (isFile) {
    fileName = file.name;
    fileType = file.type;
    fileSize = file.size;
  } else {
    fileName = `Safe-template-${generatePublicId()}`;
    fileType = "application/pdf";
    fileSize = file.byteLength;
  }

  const { url, key, bucketUrl } = await getPresignedPutUrl({
    contentType: fileType,
    fileName,
    bucketMode,
    ...options,
  });
  const body = isFile ? await file.arrayBuffer() : file;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body,
  });
  if (!res.ok) {
    throw new Error(
      `Failed to upload file "${fileName}", failed with status code ${res.status}`,
    );
  }

  let fileUrl = bucketUrl;

  if (bucketMode === "publicBucket" && process.env.NEXT_PUBLIC_UPLOAD_DOMAIN) {
    fileUrl = `${process.env.NEXT_PUBLIC_UPLOAD_DOMAIN}/${key}`;
  }

  return {
    key,
    name: fileName,
    mimeType: fileType,
    size: fileSize,
    fileUrl,
  };
};

export type TUploadFile = Awaited<ReturnType<typeof uploadFile>>;

export const getFileFromS3 = async (key: string) => {
  const { url } = await getPresignedGetUrl(key);

  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get file "${key}", failed with status code ${response.status}`,
    );
  }

  const buffer = await response.arrayBuffer();

  const binaryData = new Uint8Array(buffer);

  return binaryData;
};
