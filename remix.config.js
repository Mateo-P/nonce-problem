// @ts-check

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  browserNodeBuiltinsPolyfill: {
    modules: { crypto: true },
  },
  cacheDirectory: './node_modules/.cache/remix',
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
  },
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: [
    /^remix-utils.*/,
    'd3-array',
    'd3-axis',
    'd3-brush',
    'd3-chord',
    'd3-color',
    'd3-contour',
    'd3-delaunay',
    'd3-dispatch',
    'd3-drag',
    'd3-dsv',
    'd3-ease',
    'd3-fetch',
    'd3-force',
    'd3-format',
    'd3-geo',
    'd3-hierarchy',
    'd3-interpolate',
    'd3-path',
    'd3-polygon',
    'd3-quadtree',
    'd3-random',
    'd3-scale-chromatic',
    'd3-scale',
    'd3-selection',
    'd3-shape',
    'd3-time-format',
    'd3-time',
    'd3-timer',
    'd3-transition',
    'd3-zoom',
    'd3',
    'delaunator',
    'internmap',
    'nanoid',
    'robust-predicates',
  ],
  serverMinify: process.env.NODE_ENV === 'production',
  serverModuleFormat: 'cjs',
  serverPlatform: 'node',
};
