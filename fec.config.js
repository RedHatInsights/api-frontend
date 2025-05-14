const path = require('path');

module.exports = {
  appUrl: '/docs/api',
  debug: true,
  useProxy: true,
  proxyVerbose: true,
  /**
   * Change to false after your app is registered in configuration files
   */
  interceptChromeConfig: false,
  /**
   * Add additional webpack plugins
   */
  plugins: [],
  sassPrefix: '.api-docs, .apiDocs',
  frontendCRDPath: path.resolve(__dirname, './deploy/frontend.yml'),
  routes: {
    ...(process.env.CONFIG_PORT && {
      '/api/chrome-service/v1/static': {
        host: `http://localhost:${process.env.CONFIG_PORT}`,
      },
    }),
  },
  hotReload: true,
  moduleFederation: {
    exclude: ['react-router-dom'],
    shared: [{ 'react-router-dom': { singleton: true, version: '*' } }],
  },
};
