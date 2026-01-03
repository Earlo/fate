import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import crypto from 'node:crypto';
import { Readable } from 'node:stream';

type UploadResult = { key: string; url: string };
type StorageProvider = 'garage' | 'cloudinary';

const bucketName = process.env.GARAGE_BUCKET || 'fate-images';
const defaultRegion = process.env.GARAGE_REGION || 'garage';

let s3Client: S3Client | null = null;
let bucketReady: Promise<void> | null = null;

const hasGarageConfig = () =>
  Boolean(
    process.env.GARAGE_ENDPOINT &&
      process.env.GARAGE_ACCESS_KEY_ID &&
      process.env.GARAGE_SECRET_ACCESS_KEY,
  );

const hasCloudinaryConfig = () =>
  Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESETS,
  );

export const resolveStorageProvider = (): StorageProvider => {
  const forced = process.env.STORAGE_PROVIDER?.toLowerCase();

  if (forced === 'garage') {
    if (!hasGarageConfig()) {
      throw new Error('Garage storage selected but not configured.');
    }
    return 'garage';
  }

  if (forced === 'cloudinary') {
    if (!hasCloudinaryConfig()) {
      throw new Error('Cloudinary storage selected but not configured.');
    }
    return 'cloudinary';
  }

  if (hasGarageConfig()) return 'garage';
  if (hasCloudinaryConfig()) return 'cloudinary';

  throw new Error('No storage provider configured. Set Garage or Cloudinary env.');
};

const getClient = () => {
  if (s3Client) return s3Client;

  const endpoint = process.env.GARAGE_ENDPOINT;
  const accessKeyId = process.env.GARAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.GARAGE_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Garage storage is not configured. Set GARAGE_ENDPOINT, GARAGE_ACCESS_KEY_ID, GARAGE_SECRET_ACCESS_KEY, GARAGE_REGION, and GARAGE_BUCKET.',
    );
  }

  s3Client = new S3Client({
    endpoint,
    region: defaultRegion,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });

  return s3Client;
};

const ensureBucketExists = () => {
  if (!bucketReady) {
    bucketReady = (async () => {
      const client = getClient();
      try {
        await client.send(new HeadBucketCommand({ Bucket: bucketName }));
      } catch {
        await client.send(new CreateBucketCommand({ Bucket: bucketName }));
      }
    })();
  }

  return bucketReady;
};

const storageUrlForKey = (key: string) =>
  `/api/images/${key.split('/').map(encodeURIComponent).join('/')}`;

const buildKey = (fileName: string, path?: string) => {
  const cleanPath = path?.replace(/^\/+|\/+$/g, '');
  const safeName = fileName.replace(/[^\w.-]+/g, '-');
  const prefix = cleanPath ? `${cleanPath}/` : '';
  return `${prefix}${crypto.randomUUID()}-${safeName}`;
};

interface UploadBufferOptions {
  buffer: Buffer;
  contentType?: string;
  path?: string;
  fileName?: string;
}

const uploadBuffer = async ({
  buffer,
  contentType,
  path,
  fileName = 'upload',
}: UploadBufferOptions): Promise<UploadResult> => {
  const client = getClient();
  await ensureBucketExists();

  const key = buildKey(fileName, path);

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return { key, url: storageUrlForKey(key) };
};

export const uploadFileToGarage = async (
  file: File,
  path?: string,
): Promise<UploadResult> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadBuffer({
    buffer,
    contentType: file.type,
    path,
    fileName: file.name || 'upload',
  });
};

export const uploadFromUrlToGarage = async (
  imageUrl: string,
  path?: string,
): Promise<UploadResult> => {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${imageUrl}`);
  }

  const contentType = response.headers.get('content-type') || undefined;
  const buffer = Buffer.from(await response.arrayBuffer());
  const fileName = new URL(imageUrl).pathname.split('/').pop() || 'image';

  return uploadBuffer({ buffer, contentType, path, fileName });
};

const uploadFileToCloudinary = async (
  file: File,
  path?: string,
): Promise<UploadResult> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESETS;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary not configured. Set NEXT_PUBLIC_CLOUDINARY_* env vars.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  if (path) formData.append('folder', path);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Cloudinary upload failed with status ${response.status}: ${errorText}`,
    );
  }

  const data = (await response.json()) as {
    public_id?: string;
    secure_url?: string;
    url?: string;
  };

  return {
    key: data.public_id || '',
    url: data.secure_url || data.url || '',
  };
};

const uploadFromUrlToCloudinary = async (
  imageUrl: string,
  path?: string,
): Promise<UploadResult> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESETS;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary not configured. Set NEXT_PUBLIC_CLOUDINARY_* env vars.');
  }

  const formData = new FormData();
  formData.append('file', imageUrl);
  formData.append('upload_preset', uploadPreset);
  if (path) formData.append('folder', path);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Cloudinary upload from URL failed with status ${response.status}: ${errorText}`,
    );
  }

  const data = (await response.json()) as {
    public_id?: string;
    secure_url?: string;
    url?: string;
  };

  return {
    key: data.public_id || '',
    url: data.secure_url || data.url || '',
  };
};

export const uploadFile = async (
  file: File,
  path?: string,
): Promise<UploadResult> => {
  const provider = resolveStorageProvider();
  return provider === 'garage'
    ? uploadFileToGarage(file, path)
    : uploadFileToCloudinary(file, path);
};

export const uploadFromUrl = async (
  imageUrl: string,
  path?: string,
): Promise<UploadResult> => {
  const provider = resolveStorageProvider();
  return provider === 'garage'
    ? uploadFromUrlToGarage(imageUrl, path)
    : uploadFromUrlToCloudinary(imageUrl, path);
};

export const getObjectFromGarage = async (key: string) => {
  const client = getClient();
  await ensureBucketExists();

  const object = await client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );

  const body = object.Body;

  const stream =
    body instanceof Readable
      ? Readable.toWeb(body)
      : (body as ReadableStream<Uint8Array>);

  return {
    stream,
    contentType: object.ContentType || 'application/octet-stream',
    contentLength: object.ContentLength,
  };
};
