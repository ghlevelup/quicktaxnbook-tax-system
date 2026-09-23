import express from 'express';

import { authenticate } from '@/shared/middlewares/auth';
import { imageUpload } from '@/shared/middlewares/upload';

import * as profileController from './profile.controller';

const router = express.Router();

router.use(authenticate());

router.get('/', profileController.getMe);
router.patch('/', profileController.updateMe);
router.patch('/password', profileController.changeMyPassword);
router.post('/avatar', imageUpload.single('avatar'), profileController.uploadMyAvatar);

export default router;
