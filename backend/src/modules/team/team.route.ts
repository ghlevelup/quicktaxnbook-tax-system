import express from 'express';

import { authenticate, requireFirmAdmin } from '@/shared/middlewares/auth';

import * as teamController from './team.controller';

const router = express.Router();

router.use(authenticate(), requireFirmAdmin);

router.route('/').post(teamController.createTeamMember).get(teamController.listTeamMembers);

router.post('/ghl/sync', teamController.syncTeamFromGhl);

router.route('/:memberId').get(teamController.getTeamMember).patch(teamController.updateTeamMember);

router.patch('/:memberId/status', teamController.updateTeamMemberStatus);
router.patch('/:memberId/reset-password', teamController.resetTeamMemberPassword);

export default router;
