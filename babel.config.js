require.extensions['.css'] = () => undefined;

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: '> 0.25%, not dead',
      },
    ],
    '@babel/react',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-object-rest-spread',
    'lodash',
    [
      'transform-imports',
      {
        '@patternfly/react-icons': {
          transform: (importName) =>
            `@patternfly/react-icons/dist/js/icons/${importName
              .split(/(?=[A-Z])/)
              .join('-')
              .toLowerCase()}.js`,
          preventFullImport: true,
        },
      },
    ],
  ],
  ignore: ['node_modules'],
};
