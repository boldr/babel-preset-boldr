const path = require('path');

const env = process.env.BABEL_ENV || process.env.NODE_ENV;
const validTargets = ['7', '7.6', '8', 'current'];

module.exports = function(context, opts) {
  opts = opts || { };
  const targetOption = String(opts.target);
  // use indexOf to support node 4
  if (targetOption && validTargets.indexOf(targetOption) === -1) {
    throw new Error(`Preset boldr/node 'target' option must one of ${validTargets.join(', ')}.`);
  }

  const target = targetOption !== 'current' ? targetOption : process.versions.node;
  const loose = opts.loose !== undefined ? opts.loose : false;
  const modules = opts['preset-env'].modules !== undefined ? opts['preset-env'].modules : 'commonjs';

  if (modules !== false && modules !== 'commonjs') {
    throw new Error("Preset boldr/node 'modules' option must be 'false' to indicate no modules\n" +
      "or 'commonjs' (default)");
  }
  if (typeof loose !== 'boolean') throw new Error("Preset boldr/node 'loose' option must be a boolean.");
  const optsLoose = { loose };

  const envOpts = {
    debug: false,
    modules: modules,
  	targets: {
      node: target
    },
  	useBuiltIns: true,
    exclude: ['transform-regenerator', 'transform-async-to-generator'],
  }
  presets: [
    [
      require.resolve('babel-preset-env'),
      Object.assign({ }, envOpts, opts['preset-env'] || { })
    ],
    require.resolve('babel-preset-react')
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
    modules === 'commonjs' && [require('babel-plugin-transform-es2015-modules-commonjs'), optsLoose],
    // class { handleClick = () => { } }
    require.resolve('babel-plugin-transform-class-properties'),
    // { ...param, completed: true }
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
if (env === 'production') {
  const prodPlugins = [
    require.resolve('babel-plugin-transform-flow-strip-types'),
  ];

  module.exports.plugins.push(...prodPlugins);
}
