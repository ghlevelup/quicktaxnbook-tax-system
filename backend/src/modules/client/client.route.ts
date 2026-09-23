import express from 'express';

import { authenticate, requireFirmStaff } from '@/shared/middlewares/auth';

import * as clientController from './client.controller';

const router = express.Router();

router.use(authenticate(), requireFirmStaff);

router.route('/').post(clientController.createClient).get(clientController.listClients);
router.get('/:clientId', clientController.getClient);
router.post('/:clientId/onboarding-link', clientController.createOnboardingLink);

export default router;
