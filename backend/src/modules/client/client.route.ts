import express from 'express';

import { authenticate, requireFirmAdmin, requireFirmStaff } from '@/shared/middlewares/auth';

import * as clientController from './client.controller';

const router = express.Router();

router.use(authenticate(), requireFirmStaff);

router.route('/').post(clientController.createClient).get(clientController.listClients);

// Contacts tagged as clients in the firm's GoHighLevel sub-account.
router.post('/ghl/sync', clientController.syncClientsFromGhl);

router.get('/:clientId', clientController.getClient);
router.post('/:clientId/onboarding-link', clientController.createOnboardingLink);
router.patch('/:clientId/status', requireFirmAdmin, clientController.updateClientStatus);

export default router;
