/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default () => {
  process.env = {
    ...process.env,
    ALLOWED_ORIGINS: 'localhost',
    AUTH0_API_AUDIENCE: 'https://test.com',
    AUTH0_CALLBACK_URL: 'https://test.com',
    AUTH0_CLIENT_ID: 'https://test.com',
    AUTH0_CLIENT_SECRET: 'https://test.com',
    AUTH0_DOMAIN: 'https://test.com',
    AUTH0_LOGOUT_URL: 'https://test.com',
    AUTH0_SCOPES: 'https://test.com',
    COOKIE_SECRET: 'somesecretvalue',
    JANUS_API_DOMAIN: 'https://test.com',
    PUBLIC_MUI_DATA_GRID_LICENSE: 'https://test.com',
  };

  return defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
      coverage: {
        provider: 'v8',
      },
      environment: 'happy-dom',
      globals: true,
      setupFiles: ['./app/tests-setup.ts'],
    },
  });
};
