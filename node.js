const path = require('path');
const environment = process.env.NODE_ENV || 'development';

const defaults = {
  debug: false,
  loose: false,
  modules: false,
  targets: {
    node: 8
  },
  exclude: ['transform-regenerator', 'transform-async-to-generator'],
  useBuiltIns: true
};

module.exports = function(context, opts = {}) {
  const options = Object.assign({}, defaults, opts);

  const config = {
    presets: [
      [require.resolve('babel-preset-env'), opts],
      require.resolve('babel-preset-react'),
    ],
    plugins: [
      require.resolve('babel-plugin-syntax-flow'),
      require.resolve('babel-plugin-syntax-dynamic-import'),
      [
        require.resolve('fast-async'),
        {
          spec: true,
        },
      ],
      require.resolve('babel-plugin-transform-class-properties'),
      require.resolve('babel-plugin-transform-export-extensions'),
      [
        require.resolve('babel-plugin-transform-object-rest-spread'),
        {
          useBuiltIns: true,
        },
      ],
      require.resolve('babel-plugin-transform-decorators-legacy'),
      require.resolve('babel-plugin-dynamic-import-node'),
    ],
  };
  if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
      require.resolve('babel-plugin-transform-flow-strip-types')
    );
  }

  return config;
}
