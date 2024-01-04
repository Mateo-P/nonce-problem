import { createCookieSessionStorage } from '@remix-run/node';
import { GLOBAL_ENVIRONMENT } from '@/constants/env.server';
import { DEFAULT_COOKIE_SETTINGS } from '@/cookies/constants.server';
import Authenticator from '@/lib/spyc-remix-auth';

const authSessionStorage = createCookieSessionStorage({
  cookie: {
    ...DEFAULT_COOKIE_SETTINGS,
    sameSite: 'lax', // helps with CSRF
    secrets: [GLOBAL_ENVIRONMENT.COOKIE_SECRET],
  },
});

export const remixAuth0 = new Authenticator({
  auth0Domain: GLOBAL_ENVIRONMENT.AUTH0_DOMAIN,
  callbackURL: GLOBAL_ENVIRONMENT.AUTH0_CALLBACK_URL,
  clientCredentials: {
    audience: GLOBAL_ENVIRONMENT.AUTH0_API_AUDIENCE,
    clientID: GLOBAL_ENVIRONMENT.AUTH0_CLIENT_ID,
    clientSecret: GLOBAL_ENVIRONMENT.AUTH0_CLIENT_SECRET,
    scope: GLOBAL_ENVIRONMENT.AUTH0_SCOPES,
  },
  failureRedirect: '/logout',
  session: authSessionStorage,
  refreshTokensEnabled: true,
});
