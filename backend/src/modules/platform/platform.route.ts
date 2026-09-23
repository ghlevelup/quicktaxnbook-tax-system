import express from 'express';

import { authenticate, requirePlatformOwner } from '@/shared/middlewares/auth';

import * as platformController from './platform.controller';

const router = express.Router();

router.use(authenticate(), requirePlatformOwner);

router.route('/firms').post(platformController.onboardFirm).get(platformController.listFirms);

router.route('/firms/:firmId').get(platformController.getFirm);

router.patch('/firms/:firmId/status', platformController.updateFirmStatus);

export default router;
