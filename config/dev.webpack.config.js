const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  https: true,
  modules: ['apiDocs'],
});

const modulesConfig = require('@redhat-cloud-services/frontend-components-config/federated-modules')(
  {
    root: resolve(__dirname, '../'),
    moduleName: 'apiDocs',
    useFileHash: false,
  }
);

plugins.push(modulesConfig);

module.exports = {
  ...webpackConfig,
  plugins,
};
