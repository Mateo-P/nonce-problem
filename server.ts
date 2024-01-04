import * as path from 'node:path';
import { createRequestHandler } from '@remix-run/express';
import type { RequestHandler } from '@remix-run/express';
import { broadcastDevReady, installGlobals } from '@remix-run/node';
import type { ServerBuild } from '@remix-run/node';
import type Chokidar from 'chokidar';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import sourceMapSupport from 'source-map-support';

// patch in Remix runtime globals
installGlobals();
sourceMapSupport.install();

const PATHS = {
  Build: path.resolve('./build/index.js'),
  Watch: path.resolve('./build/version.txt'),
};

let build = require(PATHS.Build) as ServerBuild;

// We'll make chokidar a dev dependency so it doesn't get bundled in production.
const chokidar =
  process.env.NODE_ENV === 'development'
    ? (require('chokidar') as typeof Chokidar)
    : null;

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by');

// Remix fingerprints its assets so we can cache forever.
app.use(
  '/build',
  express.static('public/build', { immutable: true, maxAge: '1y' }),
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('public', { maxAge: '1h' }));

app.use(morgan('tiny'));

// Check if the server is running in development mode and use the devBuild to reflect realtime changes in the codebase.
app.all(
  '*',
  process.env.NODE_ENV === 'development'
    ? createDevRequestHandler()
    : createRequestHandler({
        build,
        mode: process.env.NODE_ENV,
      }),
);

const port = process.env['PORT'] ?? 3000;

app.listen(port, async () => {
  console.log(`Server listening on: http://localhost:${port} 🚀`);

  // send "ready" message to dev server
  if (process.env.NODE_ENV === 'development') {
    await broadcastDevReady(build);
  }
});

// Create a request handler that watches for changes to the server build during development.
function createDevRequestHandler(): RequestHandler {
  async function handleServerUpdate() {
    // 1. re-import the server build
    build = await reimportServer();

    // 2. tell dev server that this app server is now up-to-date and ready
    await broadcastDevReady(build);
  }

  chokidar
    ?.watch(PATHS.Watch, { ignoreInitial: true })
    .on('add', handleServerUpdate)
    .on('change', handleServerUpdate);

  // wrap request handler to make sure its recreated with the latest build for every request
  return async (req, res, next) => {
    try {
      // eslint-disable-next-line @typescript-eslint/return-await
      return createRequestHandler({
        build,
        mode: 'development',
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

// CJS require cache busting
async function reimportServer(): Promise<ServerBuild> {
  // 1. manually remove the server build from the require cache
  Object.keys(require.cache).forEach((key) => {
    if (key.startsWith(PATHS.Build)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete require.cache[key];
    }
  });

  // 2. re-import the server build
  return await Promise.resolve(require(PATHS.Build) as ServerBuild);
}
