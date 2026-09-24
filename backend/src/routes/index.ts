import express from 'express';

import authRoute from '../modules/auth/auth.route';
import clientRoute from '../modules/client/client.route';
import ghlRoute from '../modules/ghl/ghl.route';
import onboardingRoute from '../modules/client/onboarding.route';
import documentRoute from '../modules/document/document.route';
import opportunityRoute from '../modules/ghl/ghl.opportunity.route';
import platformRoute from '../modules/platform/platform.route';
import profileRoute from '../modules/profile/profile.route';
import teamRoute from '../modules/team/team.route';
import healthRoute from '../modules/health/health.route';
import docsRoute from './docs.route';

const router = express.Router();

interface RouteConfig {
  path: string;
  route: express.Router;
  middleware?: express.RequestHandler[];
}

const routes: RouteConfig[] = [
  { path: '/health', route: healthRoute },
  { path: '/auth', route: authRoute },
  { path: '/me', route: profileRoute },
  { path: '/platform', route: platformRoute },
  { path: '/ghl', route: ghlRoute },
  { path: '/opportunities', route: opportunityRoute },
  { path: '/documents', route: documentRoute },
  { path: '/team', route: teamRoute },
  { path: '/clients', route: clientRoute },
  { path: '/onboarding', route: onboardingRoute },
  { path: '/docs', route: docsRoute },
];

// Register all routes
routes.forEach(({ path, route, middleware = [] }) => {
  if (middleware.length > 0) {
    router.use(path, middleware, route);
  } else {
    router.use(path, route);
  }
});

export default router;
