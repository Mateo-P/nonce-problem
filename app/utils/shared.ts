import crypto from 'crypto';
import { getBrowserEnvironment } from './env';

export const now = new Date().getTime();
export const IS_SERVER = typeof process !== 'undefined';
export const isEven = (num: number) => num % 2 === 0;

export function invariant(
  condition: boolean,
  message: string | (() => string) = 'Invariant failed',
): asserts condition {
  if (!condition) {
    throw new Error(typeof message === 'string' ? message : message());
  }
}


export function mergeStrings(s1: string, s2: string): string {
  let result = '';
  let i = 0;
  while (i < s1.length || i < s2.length) {
    if (i < s1.length) {
      result += s1.charAt(i);
    }

    if (i < s2.length) {
      result += s2.charAt(i);
    }

    i++;
  }

  return result;
}

export const generateDynamicNonce = () => {
  // Use a cryptographic hash function (e.g., SHA-256) to generate a nonce
  const hash = crypto.createHash('sha256');
  const timeServer = IS_SERVER ? now : window.ENV?.PUBLIC_DATE;

  hash.update(
    mergeStrings(
      `${timeServer}`,
      getBrowserEnvironment('PUBLIC_MUI_DATA_GRID_LICENSE'),
    ),
  );
  const nonce = hash.digest('base64');
  return nonce;
};

export const cspScriptNonce = generateDynamicNonce();
