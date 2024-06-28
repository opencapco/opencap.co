import { env } from "@/env";
import {
  getPresignedGetUrl,
  getPresignedPutUrl,
  type getPresignedUrlOptions,
} from "@/server/file-uploads";

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
  file: File,
  options: Pick<
    getPresignedUrlOptions,
    "expiresIn" | "keyPrefix" | "identifier"
  >,
  bucketMode: "publicBucket" | "privateBucket" = "privateBucket",
) => {
  const { url, key, bucketUrl } = await getPresignedPutUrl({
    contentType: file.type,
    fileName: file.name,
    bucketMode,
    ...options,
  });
  const body = await file.arrayBuffer();
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body,
  });
  if (!res.ok) {
    throw new Error(
      `Failed to upload file "${file.name}", failed with status code ${res.status}`,
    );
  }

  const { name, type, size } = file;
  let fileUrl = bucketUrl;

  const uploadDomain =
    process.env.NEXT_PUBLIC_UPLOAD_DOMAIN || env.NEXT_PUBLIC_UPLOAD_DOMAIN;

  if (bucketMode === "publicBucket" && uploadDomain) {
    fileUrl = `${uploadDomain}/${key}`;
  }

  return {
    key,
    name,
    mimeType: type,
    size,
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
