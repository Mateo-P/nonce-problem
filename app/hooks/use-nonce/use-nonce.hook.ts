
import { IS_SERVER, cspScriptNonce } from '@/utils/shared';

export const useNonce = () => {
  let nonce = cspScriptNonce;
  // handle client hydratation nonce mismatch
  if (!IS_SERVER) {
    nonce = '';
  }
  return nonce;
};
