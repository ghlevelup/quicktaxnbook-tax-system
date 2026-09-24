import express from 'express';

import { authenticate, requirePlatformOwner } from '@/shared/middlewares/auth';
import { authLimiter } from '@/shared/middlewares/rate-limiter';

import * as platformController from './platform.controller';

const router = express.Router();

// The platform area is the agency admin's. They get in with the GoHighLevel agency
// Private Integration Token + relationship number (no password), or by password at /login.
// The one public endpoint: the agency admin enters with the agency token and
// relationship number (see `enterAgency`). Failed attempts are rate-limited.
router.post('/agency/enter', authLimiter, platformController.enterAgency);

router.use(authenticate(), requirePlatformOwner);

router.get('/ghl/agency', platformController.getAgencyConnection);
router.post('/ghl/agency/connect', authLimiter, platformController.connectAgency);
router.get('/ghl/agency/locations', platformController.listAgencyLocations);

router.route('/firms').post(platformController.onboardFirm).get(platformController.listFirms);

router.route('/firms/:firmId').get(platformController.getFirm);

router.patch('/firms/:firmId/status', platformController.updateFirmStatus);

export default router;
