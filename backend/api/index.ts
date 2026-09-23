// Vercel serverless entrypoint. Files under /api become serverless functions;
// exporting the Express app directly (no app.listen()) lets Vercel's Node.js
// runtime treat it as the request handler for every route matched by the
// rewrite in vercel.json. Local dev still uses src/index.ts (a normal
// long-running server via `npm run dev`) — this file is Vercel-only.
//
// Imports from ../build (not ../src) deliberately: Vercel's Node builder
// transpiles each .ts file independently and does not resolve the "@/*"
// tsconfig path aliases used throughout src/ (those only resolve locally via
// tsconfig-paths/register, which isn't loaded in the deployed runtime). The
// build script's `tsc && tscpaths` pass rewrites every "@/" import to a real
// relative path in the compiled output, so requiring the built JS sidesteps
// the alias problem entirely.
import app from '../build/src/app';

export default app;
