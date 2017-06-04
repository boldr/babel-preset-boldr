const path = require('path');
const environment = process.env.NODE_ENV || 'development';

const defaults = {
  debug: false,
  loose: false,
  modules: false,
  targets: {
    uglify: true,
    browsers: ['> .5% in US', 'last 1 versions'],
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
      // class { handleClick = () => { } }
      [
        require.resolve('babel-plugin-transform-class-properties'),
        {
          spec: true,
        },
      ],
      require.resolve('babel-plugin-transform-decorators-legacy'),
      // { ...param, completed: true }
      [
        require.resolve('babel-plugin-transform-object-rest-spread'),
        {
          useBuiltIns: true,
        },
      ],
      // Transforms JSX - Added so object-rest-spread in JSX uses builtIn
      [
        require.resolve('babel-plugin-transform-react-jsx'),
        {
          useBuiltIns: true,
        },
      ],
    ],
  };

  if (process.env.NODE_ENV === 'development' || 'test') {
    config.plugins.push(
      // Adds component stack to warning messages
      require.resolve('babel-plugin-transform-react-jsx-source'),
      // Adds __self attribute to JSX which React will use for some warnings
      require.resolve('babel-plugin-transform-react-jsx-self'),
    );
  }

  if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
      [require.resolve('babel-plugin-transform-react-remove-prop-types'), { removeImport: true }],
      require.resolve('babel-plugin-transform-react-constant-elements'),
      require.resolve('babel-plugin-transform-react-inline-elements'),
      require.resolve('babel-plugin-transform-flow-strip-types'),
    );
  }

  return config;
}
