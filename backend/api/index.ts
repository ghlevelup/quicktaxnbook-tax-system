// Vercel serverless entrypoint. Files under /api become serverless functions;
// exporting the Express app directly (no app.listen()) lets Vercel's Node.js
// runtime treat it as the request handler for every route matched by the
// rewrite in vercel.json. Local dev still uses src/index.ts (a normal
// long-running server via `npm run dev`) — this file is Vercel-only.
import app from '../src/app';

export default app;
