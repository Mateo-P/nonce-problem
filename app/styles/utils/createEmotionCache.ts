import createCache from '@emotion/cache';
import { cspScriptNonce } from '@/utils/shared';

export default function createEmotionCache() {
  return createCache({ key: 'css', nonce: cspScriptNonce });
}
