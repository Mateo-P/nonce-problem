import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode, useMemo, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import ClientStyleContext from '@/styles/style-context.client';
import createEmotionCache from '@/styles/utils/createEmotionCache';

type ClientCacheProviderProps = React.PropsWithChildren;

const ClientCacheProvider = (props: ClientCacheProviderProps) => {
  const [cache, setCache] = useState(createEmotionCache());

  const clientStyleContextValue = useMemo(() => {
    return {
      reset() {
        setCache(createEmotionCache());
      },
    };
  }, []);

  return (
    <ClientStyleContext.Provider value={clientStyleContextValue}>
      <CacheProvider value={cache}>{props.children}</CacheProvider>
    </ClientStyleContext.Provider>
  );
};

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <ClientCacheProvider>
        <ThemeProvider theme={{}}>
          <CssBaseline />

          <RemixBrowser />
        </ThemeProvider>
      </ClientCacheProvider>
    </StrictMode>,
  );
});
