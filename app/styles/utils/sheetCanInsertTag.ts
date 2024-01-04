import type { EmotionCache } from '@emotion/cache';

export const sheetCanInsertTag = (
  emotionSheet: EmotionCache['sheet'],
): emotionSheet is EmotionCache['sheet'] & {
  _insertTag: (tag: HTMLStyleElement) => void;
} =>
  '_insertTag' in emotionSheet && typeof emotionSheet._insertTag === 'function';
