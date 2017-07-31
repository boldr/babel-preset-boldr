const defaults = {
  verbose: false,
  modules: false,
  // Prefer built-ins over custom code. This mainly benefits for modern engines.
  useBuiltIns: true,

  // Whether to enable source map output
  sourceMaps: true,

  // Enable full compression on production scripts or basic compression for libraries or during development.
  compression: false,

  // Keeping comments to be compatible with Webpack's magic comments
  comments: true,
  // Do not apply general minification by default
  minified: true,
  // Env Settings
  looseMode: true,
  specMode: false,
  // transform-runtime
  // -- generators
  regen: false,
  // -- helpers
  rtHelpers: false,
  // -- require polyfill
  polyfill: false,
  // fast async
  // -- transpile using spec helpers -- no run time required, but slower.
  // --- !!! MUST be false if nodentRt is true
  faSpecMode: true,
  // -- use nodent runtime for async/await - much faster than babel
  nodentRt: false,
  targets: {
    uglify: true,
    browsers: 'last 2 versions',
  },
  exclude: ['transform-regenerator', 'transform-async-to-generator'],
  // Lodash Plugin Settings
  lodashInc: ['lodash', 'async', 'ramda', 'recompose'],
  universal: true,
  styled: true,
};

module.exports = function(context, opts = {}) {
  const options = Object.assign({}, defaults, opts);
  const currentEnv = opts.env || process.env.BABEL_ENV || process.env.NODE_ENV || 'development';
  const isProduction = /\bproduction\b/.test(currentEnv);

  const config = {
    // keep comments -- Y/N
    comments: options.comments,
    compact: true,
    // enable minification -- Y/N
    minified: isProduction,
    // enable sourceMaps -- Y/N
    sourceMaps: options.sourceMaps,
    presets: [
      [
        require.resolve('babel-preset-env'),
        {
          // Setting this to false will not transform modules.
          modules: options.modules,

          // Prefer built-ins which also prefers global polyfills which is the right thing to do
          // for most scenarios like SPAs and NodeJS environments.
          useBuiltIns: options.useBuiltIns,

          // Options to tweak the details of the implementation. If both are `false` the environment
          // preset is executed in default mode.
          loose: options.looseMode,
          spec: options.specMode,

          // verbose output of features, plugins and presets which are enabled.
          // verbose: true,

          // We prefer the transpilation of the "fast-async" plugin over the
          // slower and more complex Babel internal implementation.
          exclude: options.exclude,

          // Differ between development and production for our scope.
          // NodeJS is generally fine in development to match the runtime version which is currently installed.
          targets: options.targets,
        },
      ],
      require.resolve('babel-preset-react'),
    ],
    plugins: [
      require.resolve('babel-plugin-syntax-decorators'),
      require.resolve('babel-plugin-syntax-flow'),
      require.resolve('babel-plugin-syntax-dynamic-import'),
      // FAST ASYNC
      // -----------------------------------------------------------------------------
      // --- Implements the ES7 keywords async and await using syntax transformation at compile-time, rather than generators.
      // --- https://www.npmjs.com/package/fast-async
      [
        require.resolve('fast-async'),
        {
          spec: options.faSpecMode,
          useRuntimeModule: options.nodentRt,
        },
      ],
      require.resolve('babel-plugin-transform-decorators-legacy'),
      // TRANSFORM CLASS PROPERTIES
      // -----------------------------------------------------------------------------
      // --- Support for ES7 Class Properties (currently stage-2)
      // --- class { handleClick = () => { } }
      [
        require.resolve('babel-plugin-transform-class-properties'),
        {
          spec: true,
        },
      ],

      // TRANSFORM OBJECT REST SPREAD
      // -----------------------------------------------------------------------------
      // --- Support for Object Rest Spread `...` operator in objects.
      [
        require.resolve('babel-plugin-transform-object-rest-spread'),
        {
          useBuiltIns: true,
        },
      ],
      // TRANSFORM EXPORT EXTENSIONS
      // -----------------------------------------------------------------------------
      // --- Allow export * from '...'
      require.resolve('babel-plugin-transform-export-extensions'),
      // TRANSFORM REACT JSX
      // -----------------------------------------------------------------------------
      // --- Use builtins
      // --- specify pragma jic
      [
        require.resolve('babel-plugin-transform-react-jsx'),
        {
          useBuiltIns: true,
        },
      ],
      // TRANSFORM RUNTIME:
      // -----------------------------------------------------------------------------
      // --- Only helpers
      [
        require.resolve('babel-plugin-transform-runtime'),
        {
          helpers: options.rtHelpers,
          regenerator: options.regen,
          polyfill: options.polyfill,
          useBuiltIns: options.useBuiltIns,
        },
      ],
    ],
  };

  if (!isProduction) {
    // TRANSFORM REACT JSX SOURCE & JSX SELF
    // -----------------------------------------------------------------------------
    // --- https://github.com/facebookincubator/create-react-app/issues/989
    // --- Improve development verboseging experience with React
    config.plugins.push(
      // Adds component stack to warning messages
      require.resolve('babel-plugin-transform-react-jsx-source'),
      // Adds __self attribute to JSX which React will use for some warnings
      require.resolve('babel-plugin-transform-react-jsx-self'),
    );
  }
  if (options.styled === true) {
    config.plugins.push([
      require.resolve('babel-plugin-styled-components'),
      { displayName: currentEnv === 'test' || currentEnv === 'development', ssr: true },
    ]);
  }
  if (options.universal === true) {
    config.plugins.push(require.resolve('babel-plugin-universal-import'));
  }
  if (isProduction) {
    config.presets.push([
      require.resolve('babel-preset-babili'),
      {
        booleans: false,
        deadcode: false,
        infinity: false,
        mangle: false,
        flipComparisons: false,
        replace: false,
        simplify: false,
      },
    ]);
    config.plugins.push(
      // TRANSFORM REACT REMOVE PROP TYPES
      // -----------------------------------------------------------------------------
      // --- https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types
      // --- Remove unnecessary React propTypes from the production build.
      [require.resolve('babel-plugin-transform-react-remove-prop-types'), { removeImport: true }],
      // TRANSFORM REACT CONSTANT ELEMENTS:
      // -----------------------------------------------------------------------------
      // --- https://babeljs.io/docs/plugins/transform-react-constant-elements/
      require.resolve('babel-plugin-transform-react-constant-elements'),
      // TRANSFORM REACT INLINE ELEMENTS:
      // -----------------------------------------------------------------------------
      // --- https://babeljs.io/docs/plugins/transform-react-inline-elements/
      // --- Replaces the React.createElement function with one that is more optimized for production.
      // --- NOTE: Symbol needs to be polyfilled.
      require.resolve('babel-plugin-transform-react-inline-elements'),
      // TRANSFORM FLOW STRIP TYPES
      // -----------------------------------------------------------------------------
      // --- Remove flowtypes from the code
      require.resolve('babel-plugin-transform-flow-strip-types'),
      // LODASH
      // -----------------------------------------------------------------------------
      // --- Optimization for cheery-picking from lodash, asyncjs, ramba and recompose.
      // --- Auto cherry-picking es2015 imports from path imports.
      // ---        @example:
      // ---            import getIn from 'lodash/getIn';
      // --- https://github.com/acdlite/recompose#using-babel-lodash-plugin
      [require.resolve('babel-plugin-lodash'), { id: options.lodashInc }],
    );
  }

  return config;
};
