import type { BrowserEnvironment } from '@/constants/env.server';
import { GLOBAL_ENVIRONMENT } from '@/constants/env.server';
import { IS_SERVER } from './shared';

export const getBrowserEnvironment = <EnvKey extends keyof BrowserEnvironment>(
  envKey: EnvKey,
): BrowserEnvironment[EnvKey] => {
  if (IS_SERVER) return GLOBAL_ENVIRONMENT[envKey];

  if (window.ENV == null) {
    throw new Error(
      `The \`<PublicEnv />\` component is missing at the \`root\` of your app.`,
    );
  }
  if (!envKey.startsWith('PUBLIC_')) {
    throw new Error(`The requested variable is not public`);
  }

  return window.ENV[envKey];
};
