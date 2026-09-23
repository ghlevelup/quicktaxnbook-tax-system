import httpStatus from 'http-status';
import multer from 'multer';

import ApiError from '@/shared/utils/api-error';

const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);

/** In-memory image upload (avatars/logos) — persisted to disk by storage.service. */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      cb(new ApiError(httpStatus.BAD_REQUEST, 'Only PNG, JPEG, or WEBP images are allowed'));
      return;
    }
    cb(null, true);
  },
});
