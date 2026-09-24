import express from 'express';

import { authenticate, requireClient, requireFirmStaff } from '@/shared/middlewares/auth';

import * as controller from './ghl.opportunity.controller';

const router = express.Router();

router.use(authenticate());

// --- Firm staff -------------------------------------------------------------
router.get('/', requireFirmStaff, controller.listOpportunities);
router.get('/pipelines', requireFirmStaff, controller.listPipelines);
router.post('/refresh', requireFirmStaff, controller.refreshOpportunities);
router.patch('/:opportunityId/stage', requireFirmStaff, controller.moveStage);

// --- Client portal ----------------------------------------------------------
// Separate path rather than a role branch inside the staff handler, so the
// client route can never fall through to the firm-wide listing.
router.get('/mine/list', requireClient, controller.listMyOpportunities);

export default router;
