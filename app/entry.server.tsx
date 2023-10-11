import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { RemixServer } from '@remix-run/react';
import type { EntryContext } from '@remix-run/node';
import createEmotionCache from './src/createEmotionCache';
import theme from './src/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);
  const loaderData = remixContext.staticHandlerContext.loaderData as {
    root: {
      cspScriptNonce: string | undefined;
    };
  };
  const nonce = loaderData.root.cspScriptNonce;


  function MuiRemixServer() {
    return (
      <CacheProvider value={cache}>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <RemixServer context={remixContext} url={request.url} />
        </ThemeProvider>
      </CacheProvider>
    );
  }

  // Render the component to a string.
  const html = ReactDOMServer.renderToString(<MuiRemixServer />);

  // Grab the CSS from emotion
  const { styles } = extractCriticalToChunks(html);

  let stylesHTML = '';

  styles.forEach(({ key, ids, css }) => {
    const emotionKey = `${key} ${ids.join(' ')}`;
    const newStyleTag = `<style nonce="${nonce}" data-emotion="${emotionKey}">${css}</style>`;
    stylesHTML = `${stylesHTML}${newStyleTag}`;
  });

  // Add the Emotion style tags after the insertion point meta tag
  const markup = html.replace(
    /<meta(\s)*name="emotion-insertion-point"(\s)*content="emotion-insertion-point"(\s)*\/>/,
    `<meta name="emotion-insertion-point" content="emotion-insertion-point"/>${stylesHTML}`,
  );

  const { CSPolicy, CSPheaders } = createCSP(nonce);
  responseHeaders.set(CSPolicy, CSPheaders);
  responseHeaders.set('Content-Type', 'text/html');

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}

const createCSP = (nonce?: string) => {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Use type assertions to specify the types of loaderData and cspScriptNonce

  let scriptSrc: string;
  if (typeof nonce === "string" && nonce.length > 10) {
    scriptSrc = `'report-sample' 'nonce-${nonce}'`;
  } else if (isDevelopment) {
    // Allow the <LiveReload /> component to load without a nonce in the error pages
    scriptSrc = "'report-sample' 'unsafe-inline'";
  } else {
    scriptSrc = "'report-sample'";
  }

  const connectSrc = isDevelopment ? "ws://localhost:*" : "";

  const CSPolicy = isDevelopment
    ? "Content-Security-Policy"
    : "Content-Security-Policy";

  const CSPheaders =
    "default-src 'self'; " +
    `script-src 'self' ${scriptSrc}; ` +
    `style-src 'self' 'sha256-zRov+xUGJ/uvnA8bUk72Bu/FQ7Uk11WaDIOM4b+hpX0=' ${scriptSrc}; ` +
    "img-src 'self' data: blob:; " +
    `connect-src 'self' ${connectSrc} data:; ` +
    "object-src 'none'; " +
    "worker-src 'self' blob:; " +
    "frame-ancestors 'none'; " +
    "report-to /reporting/csp";
  return { CSPolicy, CSPheaders };
};
