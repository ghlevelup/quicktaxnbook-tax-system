import express from 'express';

import { authenticate, requireFirmAdmin, requireFirmStaff } from '@/shared/middlewares/auth';

import * as clientController from './client.controller';

const router = express.Router();

router.use(authenticate(), requireFirmStaff);

// Adding a client is the firm owner's job; team members can only view.
router
  .route('/')
  .post(requireFirmAdmin, clientController.createClient)
  .get(clientController.listClients);

// Contacts tagged as clients in the firm's GoHighLevel sub-account.
router.post('/ghl/sync', clientController.syncClientsFromGhl);

router.get('/:clientId', clientController.getClient);
router.post('/:clientId/onboarding-link', clientController.createOnboardingLink);
router.patch('/:clientId/status', requireFirmAdmin, clientController.updateClientStatus);

export default router;
