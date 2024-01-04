// @ts-check

/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
module.exports = {
  singleQuote: true,
  trailingComma: 'all',

  // `@ianvs/prettier-plugin-sort-imports` config
  importOrder: ['<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[.]'],
  plugins: [
    'prettier-plugin-packagejson',
    '@ianvs/prettier-plugin-sort-imports',
  ],
};
