import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';
import { cors } from 'remix-utils/cors';
import createEmotionCache from '@/styles/utils/createEmotionCache';
import { GLOBAL_ENVIRONMENT } from './constants/env.server';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const cache = createEmotionCache();

  /* eslint-disable-next-line @typescript-eslint/unbound-method --
   * the `extractCriticalToChunks` function is typed
   * as a class member function (method syntax), while the implementation is not
   * done using a class, but a regular function (function syntax), so TypeScript
   * assumes that the `this` context is **unbound**
   *
   * - [`extractCriticalToChunks` implementation](https://github.com/emotion-js/emotion/blob/main/packages/server/src/create-instance/extract-critical-to-chunks.js)
   *
   * As a reference see [this](https://stackoverflow.com/a/62864909/14179717) StackOverflow answer
   */
  const { extractCriticalToChunks } = createEmotionServer(cache);

  const loaderData = remixContext.staticHandlerContext.loaderData as {
    root: {
      cspScriptNonce: string | undefined;
    };
  };

  const nonce = loaderData.root?.cspScriptNonce;

  const html = renderToString(
    <CacheProvider value={cache}>
      <ThemeProvider theme={{}}>
        <CssBaseline />

        <RemixServer context={remixContext} url={request.url} />
      </ThemeProvider>
    </CacheProvider>,
  );

  const { styles } = extractCriticalToChunks(html);

  const concatenatedEmotionStyleTags = styles.reduce(
    (styleTags, styleTagMetadata) => {
      const emotionKey = `${styleTagMetadata.key} ${styleTagMetadata.ids.join(
        ' ',
      )}`.trim();

      const newStyleTag = `<style nonce="${nonce}" data-emotion="${emotionKey}">${styleTagMetadata.css}</style>`;
      styleTags += newStyleTag;

      return styleTags;
    },
    '',
  );

  const markup = html.replace(
    /<meta(\s)*name="emotion-insertion-point"(\s)*content="emotion-insertion-point"(\s)*\/>/,
    `<meta name="emotion-insertion-point" content="emotion-insertion-point"/>${concatenatedEmotionStyleTags}`,
  );

  const CSPheaders = createCSP(nonce);

  responseHeaders.set('Content-Security-Policy', CSPheaders);
  responseHeaders.set('Content-Type', 'text/html');

  return await withCors(
    request,
    new Response(`<!DOCTYPE html>${markup}`, {
      headers: responseHeaders,
      status: responseStatusCode,
    }),
  );
}

const withCors = async (request: Request, response: Response) => {
  const corsResponse = await cors(request, response, {
    methods: ['GET', 'POST'],
    origin: GLOBAL_ENVIRONMENT.ALLOWED_ORIGINS.split(','),
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Connection',
      'Content-Type',
      'Host',
      'User-Agent',
    ],
  });

  return corsResponse;
};

export const createCSP = (nonce?: string) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  let scriptSrc: string;

  if (isDevelopment || typeof nonce === 'string' && nonce.length > 10) {
    scriptSrc = `'report-sample' 'nonce-${nonce}'`;
  } else {
    scriptSrc = "'report-sample'";
  }

  const connectSrc = isDevelopment ? 'ws://localhost:*' : '';

  const CSPheaders =
    "default-src 'self'; " +
    "base-uri 'self'; " +
    `script-src 'self' ${scriptSrc}; ` +
    `style-src 'self' ${scriptSrc}; ` +
    "img-src 'self' data: blob:; " +
    `connect-src 'self' ${connectSrc} data:; ` +
    "object-src 'none'; " +
    "worker-src 'self' blob:; " +
    "frame-ancestors 'none'; " +
    'report-to /reporting/csp';

  return CSPheaders;
};
