import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { StoredFile } from '@prisma/client';

import prisma from '@/client';
import config from '@/config/config';

const uploadRoot = path.join(process.cwd(), config.upload.localDir);

const ensureUploadDir = (subDir: string): string => {
  const dir = path.join(uploadRoot, subDir);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

export interface SaveLocalFileParams {
  firmId?: string;
  uploadedById?: string;
  subDir: string; // e.g. "avatars", "firm-logos"
  originalName: string;
  mimeType: string;
  buffer: Buffer;
  uploadIp?: string;
}

/** Saves a buffer to local disk under `uploads/<subDir>/` and records it as a StoredFile row. */
export const saveLocalFile = async (params: SaveLocalFileParams): Promise<StoredFile> => {
  const dir = ensureUploadDir(params.subDir);
  const ext = path.extname(params.originalName).toLowerCase();
  const filename = `${crypto.randomUUID()}${ext}`;
  const key = `${params.subDir}/${filename}`;

  fs.writeFileSync(path.join(dir, filename), params.buffer);

  const checksumSha256 = crypto.createHash('sha256').update(params.buffer).digest('hex');

  return prisma.storedFile.create({
    data: {
      firmId: params.firmId,
      provider: 'LOCAL',
      bucket: 'local',
      key,
      originalName: params.originalName,
      mimeType: params.mimeType,
      sizeBytes: BigInt(params.buffer.byteLength),
      checksumSha256,
      virusScanStatus: 'SKIPPED',
      uploadedById: params.uploadedById,
      uploadIp: params.uploadIp,
    },
  });
};

/** Public URL for a StoredFile saved via saveLocalFile — served by the static /uploads route. */
export const localFileUrl = (storedFile: Pick<StoredFile, 'provider' | 'key'>): string | null => {
  if (storedFile.provider !== 'LOCAL') return null;
  return `${config.appBaseUrl}/${config.upload.localDir}/${storedFile.key}`;
};

export const deleteLocalFile = (key: string): void => {
  const filePath = path.join(uploadRoot, key);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
