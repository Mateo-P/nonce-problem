import '@fontsource-variable/lexend/wght.css';
import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-500.css';
import '@fontsource/poppins/latin-600.css';
import '@fontsource/poppins/latin-700.css';
import { withEmotionCache } from '@emotion/react';
import { unstable_useEnhancedEffect as useEnhancedEffect } from '@mui/material/utils';
import { cssBundleHref } from '@remix-run/css-bundle';
import { json } from '@remix-run/node';
import type {
  LinkDescriptor,
  LinksFunction,
  MetaFunction,
} from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { useContext } from 'react';
import PublicEnv from '@/components/PublicEnv';
import type { BrowserEnvironment } from '@/constants/env.server';
import globalStyles from '@/styles/globals.css';
import ClientStyleContext from '@/styles/style-context.client';
import { sheetCanInsertTag } from '@/styles/utils/sheetCanInsertTag';
import { getBrowserEnvironment } from '@/utils/env';
import { cspScriptNonce, now } from './utils/shared';

export const links: LinksFunction = () => {
  const baseLink = {
    rel: 'stylesheet',
    href: globalStyles,
  } satisfies LinkDescriptor;

  if (typeof cssBundleHref === 'string') {
    return [{ rel: 'stylesheet', href: cssBundleHref }, baseLink];
  }

  return [baseLink];
};

export const meta: MetaFunction = () => {
  return [{ title: 'CCA Portal' }];
};

type DocumentProps = {
  browserEnv: BrowserEnvironment;
  nonce: string;
  children: React.ReactNode;
};

const Document = withEmotionCache<DocumentProps, unknown>(
  (props, emotionCache) => {
    const { browserEnv, nonce, children } = props;

    const clientStyleContextData = useContext(ClientStyleContext);

    useEnhancedEffect(() => {
      emotionCache.sheet.container = document.head;

      const styleTags = emotionCache.sheet.tags;

      emotionCache.sheet.flush();

      styleTags.forEach((styleTag) => {
        styleTag.nonce = cspScriptNonce;
        if (!sheetCanInsertTag(emotionCache.sheet)) return;

        emotionCache.sheet._insertTag(styleTag);
      });

      clientStyleContextData?.reset();
    }, []);

    return (
      <html lang="en">
        <head>
          {/* Global <meta /> tags ========================================= */}
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          {/* ============================================================== */}

          <Meta />

          <Links />

          <PublicEnv {...browserEnv} />

          <meta
            name="emotion-insertion-point"
            content="emotion-insertion-point"
          />
        </head>

        <body>
          {children}

          <ScrollRestoration nonce={nonce} />
          <Scripts nonce={nonce} />
          <LiveReload nonce={nonce} />
        </body>
      </html>
    );
  },
);

if (process.env.NODE_ENV !== 'production') {
  Document.displayName = 'Document';
}

export const loader = () => {
  return json({
    browserEnv: {
      PUBLIC_MUI_DATA_GRID_LICENSE: getBrowserEnvironment(
        'PUBLIC_MUI_DATA_GRID_LICENSE',
      ),
      PUBLIC_DATE: `${now}`,
    },
    cspScriptNonce,
  });
};

export default function App() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <Document
      browserEnv={loaderData.browserEnv}
      nonce={loaderData.cspScriptNonce}
    >

        <Outlet />

    </Document>
  );
}
