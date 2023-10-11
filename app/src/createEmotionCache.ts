import createCache from '@emotion/cache';
import { cryptoGetRandomString } from '~/root';

export default function createEmotionCache() {
  return createCache({ key: 'css', nonce:cryptoGetRandomString(33) });
}
