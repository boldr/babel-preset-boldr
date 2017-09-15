import path from 'path';
import { get as getAppRoot } from 'app-root-dir';
import fastAsync from 'fast-async';
import browserslist from 'browserslist';

import envPreset, { isPluginRequired } from 'babel-preset-env';
import getTargets from 'babel-preset-env/lib/targets-parser';
import envPlugins from 'babel-preset-env/data/plugins.json';
import minifyPreset from 'babel-preset-minify';
import moduleResolver from 'babel-plugin-module-resolver';
import deadCodeEliminationPlugin from 'babel-plugin-minify-dead-code-elimination';
import transformClassProperties from 'babel-plugin-transform-class-properties';
import transformObjectRestSpread from 'babel-plugin-transform-object-rest-spread';
import transformFlowStripTypes from 'babel-plugin-transform-flow-strip-types';
import transformRuntimePlugin from 'babel-plugin-transform-runtime';
import transformReactJSX from 'babel-plugin-transform-react-jsx';
import transformReactDisplayName from 'babel-plugin-transform-react-display-name';
import transformReactJSXSource from 'babel-plugin-transform-react-jsx-source';
import transformReactJSXSelf from 'babel-plugin-transform-react-jsx-self';
import transformRemovePropTypes from 'babel-plugin-transform-react-remove-prop-types';
import transformReactInlineElements from 'babel-plugin-transform-react-inline-elements';
import transformReactConstantElements from 'babel-plugin-transform-react-constant-elements';
import transformDecoratorsLegacy from 'babel-plugin-transform-decorators-legacy';
import transformExportExtensions from 'babel-plugin-transform-export-extensions';
import reactIntlPlugin from "babel-plugin-react-intl";
import syntaxDecorators from 'babel-plugin-syntax-decorators';
import syntaxFlow from 'babel-plugin-syntax-flow';
import syntaxJsx from 'babel-plugin-syntax-jsx';
import syntaxDynamicImport from 'babel-plugin-syntax-dynamic-import';
import dynamicImportNode from 'babel-plugin-dynamic-import-node';
import dynamicImportWebpack from 'babel-plugin-dynamic-import-webpack';
import universalImport from 'babel-plugin-universal-import';
import styledComponents from 'babel-plugin-styled-components';
import lodashPlugin from 'babel-plugin-lodash';

const targetModern = {
  node: '8.4.0',
  browsers: [
    'Safari >= 10.1',
    'iOS >= 10.3',
    'Edge >= 15',
    'Chrome >= 59',
    'ChromeAndroid >= 59',
    'Firefox >= 53',
  ],
};

const defaults = {
  // print explainations to console
  verbose: false,
  // One of the following:
  // - "node"/nodejs"/"script"/"binary": any NodeJS related execution with wide support to last LTS aka 6.9.0
  // - "node8": identical to the previous option but target Node v8.0.0 (next LTS) - planned for October 2017
  // - "current"/"test": current NodeJS version
  // - "browser"/"web": browsers as defined by browserslist
  // - "library": ideally used for publishing libraries e.g. on NPM
  // - "es2015": same as "library" but targets es2o15 capable engines only.
  // - "modern": same as "library" but targets modern engines only (slightly more forward-looking than es2015).
  // - {}: any custom settings support by Env-Preset
  target: 'nodejs',
  // Choose automatically depending on target or use one of these for full control:
  // - "commonjs": Transpile module imports to commonjs
  // - false: Keep module imports as is (e.g. protecting ESM for optiomal usage with Webpack)
  // - "auto": Automatic selection based on target.
  modules: 'auto',

  // Prefer built-ins over custom code. This mainly benefits for modern engines.
  useBuiltIns: true,
  // Choose environment based on environment variables ... or override with custom value here.
  env: 'auto',
  // Whether to enable source map output
  sourceMaps: true,

  // Enable full compression on production scripts or basic compression for libraries or during development.
  compression: false,
  // Keeping comments to be compatible with Webpack's magic comments
  comments: true,
  // Do not apply general minification by default
  minified: false,
  // Env Settings
  looseMode: true,
  specMode: false,
  // Choose automatically depending on target by default or use one of these for full control:
  // - "rollup-nodejs": For bundling with Rollup and later usage in NodeJS (e.g. produce binaries).
  // - "rollup-webpack": For bundling with Rollup and later usage with Webpack (e.g. publish libraries).
  // - "webpack": Improve compatibility with direct Webpack usage (add chunkNames, dynamic CSS imports, ...) (e.g. bundling applications)
  // - "auto": Automatic selection based on target.
  imports: 'auto',
  srcDir: 'src',
  // transform-runtime
  // -- generators
  regen: false,
  // -- helpers
  rtHelpers: true,
  // -- require polyfill
  polyfill: false,
  // Async settings: Either `"promises"` or `null`
  rewriteAsync: 'promises',
  // fast async
  // -- transpile using spec helpers -- no run time required, but slower.
  // --- !!! MUST be false if nodentRt is true
  faSpecMode: true,
  // -- use nodent runtime for async/await - much faster than babel
  nodentRt: false,
  jsxPragma: 'React.createElement',

  // Lodash Plugin Settings
  lodashInc: ['lodash', 'async', 'ramda', 'recompose'],
  styled: true,
  styledProcess: false,
  enableIntl: false,
};

export default function generatePreset(context, opts = {}) {
  const presets = [];
  const plugins = [];

  // These are the final options we use later on.
  const options = { ...defaults, ...opts };

  // Reset environment value when configured as "auto"
  if (opts.env === 'auto') {
    opts.env = null;
  }

  const CURRENT_ENV = opts.env || process.env.BABEL_ENV || process.env.NODE_ENV || 'development';
  const IS_PROD = /\bproduction\b/.test(CURRENT_ENV);

  if (options.verbose) {
    console.log(' ℹ️  Environment:', CURRENT_ENV);
    console.log(' ℹ️  IS_PROD:', IS_PROD);
  }
  // Auto select test target when running in test environment and no other info is available.
  if (CURRENT_ENV === 'test' && options.target == null) {
    options.target = 'test';
  }

  let targetBinary =
    options.target === 'node' ||
    options.target === 'node8' ||
    options.target === 'nodejs' ||
    options.target === 'script' ||
    options.target === 'binary';

  let targetCurrent = options.target === 'current' || options.target === 'test';

  let targetBrowserList = options.target === 'browser' || options.target === 'web';

  let targetLibrary =
    options.target === 'library' || options.target === 'es2015' || options.target === 'modern';

  let targetCustom = typeof options.target === 'object';

  let envTargets = {};

  if (targetBinary) {
    envTargets.node = options.target === 'node8' ? '8.4.0' : '6.11.1';
  } else if (targetCurrent) {
    // Scripts which are directly used like tests can be transpiled for the current NodeJS version
    envTargets.node = 'current';
  } else if (targetBrowserList) {
    // Until this issue is fixed we can't use auto config detection for browserslist in babel-preset-env
    // https://github.com/babel/babel-preset-env/issues/149
    // This is currently scheduled for v2.0 of babel-preset-env which still has some tasks on the list.
    // What we do here is actually pretty clever/stupid as we just use browserslist
    // itself to query its configuration and pass over that data again to babel-preset-env
    // for passing it to browserslist internally. Yeah.
    const autoBrowsers = browserslist(null, { env: IS_PROD ? 'production' : 'development' });

    // For the abstract browsers config we let browserslist find the config file
    envTargets.browsers = autoBrowsers;
  } else if (targetLibrary) {
    if (options.target === 'modern') {
      envTargets = targetModern;
    } else {
      // Explicit undefined results into compilation with "latest" preset supporting a wide range of clients via ES5 output
      envTargets = undefined;
    }
  } else if (targetCustom) {
    envTargets = options.target;
  }
  let additionalExcludes = [];

  // Exclude all es2015 features which are supported by the default es2015 babel preset.
  // This targets all es2015-capable browsers and engines.
  if (options.target === 'es2015') {
    additionalExcludes.push(
      'transform-es2015-template-literals',
      'transform-es2015-literals',
      'transform-es2015-function-name',
      'transform-es2015-arrow-functions',
      'transform-es2015-block-scoped-functions',
      'transform-es2015-classes',
      'transform-es2015-object-super',
      'transform-es2015-shorthand-properties',
      'transform-es2015-duplicate-keys',
      'transform-es2015-computed-properties',
      'transform-es2015-for-of',
      'transform-es2015-sticky-regex',
      'transform-es2015-unicode-regex',
      'check-es2015-constants',
      'transform-es2015-spread',
      'transform-es2015-parameters',
      'transform-es2015-destructuring',
      'transform-es2015-block-scoping',
      'transform-es2015-typeof-symbol',
      'transform-es2015-modules-commonjs',
      'transform-es2015-modules-systemjs',
      'transform-es2015-modules-amd',
      'transform-es2015-modules-umd',
    );
  }

  if (options.verbose) {
    if (options.target === 'es2015') {
      console.log('- Targeting es2015+ - Modern');
    } else {
      console.log('- Environment Targets:', envTargets);
    }
  }

  if (options.modules == null || options.modules === 'auto') {
    if (targetCurrent || targetBinary) {
      options.modules = 'commonjs';
    } else if (targetLibrary || targetBrowserList) {
      // Libraries should be published as EcmaScript modules for tree shaking support
      // For browser targets we typically use tools like Webpack which benefit from EcmaScript modules, too.
      options.modules = false;
    } else {
      // Best overall support when nothing other is applicable
      options.modules = 'commonjs';
    }
  }

  // Automatic detection of "imports" mode based on target
  if (options.imports == null || options.imports === 'auto') {
    if (targetCurrent || targetBinary) {
      options.imports = 'rollup-nodejs';
    } else if (targetLibrary || targetCustom) {
      options.imports = 'rollup-webpack';
    } else if (targetBrowserList) {
      options.imports = 'webpack';
    } else {
      options.imports = null;
    }
  }

  // Automatic chunkNames require Webpack Magic Comments, we can't remove them.
  if (options.imports === 'webpack') {
    options.comments = true;
  }
  // Directly ask babel-preset-env whether we want to use transform-async
  // based on currently configured targets. Only if that's the case we
  // transform our async/await code. Otherwise we assume it works without
  // any transpilation.
  let requiresAsync = isPluginRequired(
    getTargets(envTargets),
    envPlugins['transform-async-to-generator'],
  );
  if (!requiresAsync) {
    options.rewriteAsync = null;
  }

  if (options.verbose) {
    /* eslint-disable no-nested-ternary */
    console.log('- Module Settings:', options.modules === false ? 'ESM' : options.modules);
    console.log(
      '- Transpilation Compliance:',
      options.specMode ? 'SPEC' : options.looseMode ? 'LOOSE' : 'DEFAULT',
    );
    console.log('- Async Transpilation:', options.rewriteAsync);
  }

  // Use basic compression for libraries and full compression on binaries
  if (options.compression) {
    if (IS_PROD && targetBinary) {
      presets.push(minifyPreset);
    } else {
      // Apply some basic compression also for normal non-minified builds. After all
      // it makes no sense to publish deadcode for example.
      presets.push([
        minifyPreset,
        {
          booleans: false,
          infinity: false,
          mangle: false,
          flipComparisons: false,
          replace: false,
          simplify: false,
        },
      ]);
    }
  } else {
    plugins.push(deadCodeEliminationPlugin);
  }

  presets.push([
    envPreset,
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

      // Debug output of features, plugins and presets which are enabled.
      // debug: options.verbose,

      // We prefer the transpilation of the "fast-async" plugin over the
      // slower and more complex Babel internal implementation.
      exclude: ['transform-regenerator', 'transform-async-to-generator', ...additionalExcludes],

      // Differ between development and production for our scope.
      // NodeJS is generally fine in development to match the runtime version which is currently installed.
      targets: envTargets,
    },
  ]);
  plugins.push(syntaxDynamicImport);
  plugins.push(syntaxFlow);
  plugins.push(syntaxJsx);
  plugins.push(syntaxDecorators);
  // Transpile the parsed import() syntax for compatibility or extended features.
  if (options.imports === 'rollup-nodejs') {
    if (options.verbose) {
      console.log('- Import() rewritten using dynamic-import-node');
    }

    // Compiles import() to a deferred require() for NodeJS
    plugins.push(dynamicImportNode);
  } else if (options.imports === 'rollup-webpack') {
    if (options.verbose) {
      console.log('- Rewriting import() for Rollup bundling targeting Webpack.');
    }

    // This is our alternative appeoach for now which "protects" these imports from Rollup
    // for usage in Webpack later on (not directly). In detail it transpiles `import()` to
    // `require.ensure()` before it reaches RollupJS's bundling engine.
    // https://github.com/airbnb/babel-plugin-dynamic-import-webpack
    plugins.push(dynamicImportWebpack);
  } else if (options.imports === 'webpack') {
    if (options.verbose) {
      console.log('- Rewriting import() for Universal Webpack.');
    }

    // Dual CSS + JS imports together with automatic chunkNames and
    // optimized non-chunked server-side rendering.
    // https://github.com/airbnb/babel-plugin-dynamic-import-webpack
    plugins.push(universalImport);
  } else {
    if (options.verbose) {
      console.log('- Keeping import() statement as is.');
    }
  }

  // Supports loading files in source folder without relative folders
  // https://github.com/tleunen/babel-plugin-module-resolver
  if (options.srcDir != null) {
    plugins.push([
      moduleResolver,
      {
        alias: {
          '@': path.resolve(getAppRoot(), options.srcDir),
        },
      },
    ]);
  }
  // Add displayName to createReactClass (and React.createClass) calls
  plugins.push(transformReactDisplayName);
  // FAST ASYNC
  // -----------------------------------------------------------------------------
  // --- Implements the ES7 keywords async and await using syntax transformation at compile-time, rather than generators.
  // --- https://www.npmjs.com/package/fast-async
  if (options.rewriteAsync === 'promises') {
    plugins.push([
      fastAsync,
      {
        spec: options.faSpecMode,
        useRuntimeModule: options.nodentRt,
      },
    ]);
  }
  plugins.push(transformDecoratorsLegacy);
  // TRANSFORM CLASS PROPERTIES
  // -----------------------------------------------------------------------------
  // --- Support for ES7 Class Properties (currently stage-2)
  // --- class { handleClick = () => { } }
  plugins.push(transformClassProperties);
  // TRANSFORM OBJECT REST SPREAD
  // -----------------------------------------------------------------------------
  // --- Support for Object Rest Spread `...` operator in objects.
  plugins.push([
    transformObjectRestSpread,
    {
      useBuiltIns: options.useBuiltIns,
    },
  ]);
  // TRANSFORM EXPORT EXTENSIONS
  // -----------------------------------------------------------------------------
  // --- Allow export * from '...'
  plugins.push(transformExportExtensions);
  // TRANSFORM FLOW STRIP TYPES
  // -----------------------------------------------------------------------------
  // --- Remove flowtypes from the code
  plugins.push(transformFlowStripTypes);
  // TRANSFORM REACT JSX
  // -----------------------------------------------------------------------------
  // --- Use builtins
  // --- specify pragma jic
  plugins.push([
    transformReactJSX,
    {
      useBuiltIns: options.useBuiltIns,
      pragma: options.jsxPragma,
    },
  ]);
  // TRANSFORM REACT JSX SOURCE & JSX SELF
  // -----------------------------------------------------------------------------
  // --- https://github.com/facebookincubator/create-react-app/issues/989
  // --- Improve development verboseging experience with React
  if (!IS_PROD) {
    // Adds component stack to warning messages
    plugins.push(transformReactJSXSource);

    // Adds __self attribute to JSX which React will use for some warnings
    plugins.push(transformReactJSXSelf);
    if (options.styled) {
      plugins.push([styledComponents, { displayName: true, ssr: true }]);
    }
  }
  if (IS_PROD) {
    // LODASH
    // -----------------------------------------------------------------------------
    // --- Optimization for cheery-picking from lodash, asyncjs, ramba and recompose.
    // --- Auto cherry-picking es2015 imports from path imports.
    // ---        @example:
    // ---            import getIn from 'lodash/getIn';
    // --- https://github.com/acdlite/recompose#using-babel-lodash-plugin
    plugins.push([lodashPlugin, { id: options.lodashInc }]);
    // Remove unnecessary React propTypes from the production build.
    // https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types
    plugins.push([
      transformRemovePropTypes,
      {
        mode: 'remove',
        removeImport: true,
      },
    ]);
    if (options.enableIntl) {
        // Cleanup descriptions for translations from compilation output
        plugins.push(reactIntlPlugin)
    }
    // TRANSFORM REACT INLINE ELEMENTS:
    // -----------------------------------------------------------------------------
    // --- https://babeljs.io/docs/plugins/transform-react-inline-elements/
    // --- Replaces the React.createElement function with one that is more optimized for production.
    // --- NOTE: Symbol needs to be polyfilled.
    plugins.push(transformReactInlineElements);

    // TRANSFORM REACT CONSTANT ELEMENTS:
    // -----------------------------------------------------------------------------
    // --- https://babeljs.io/docs/plugins/transform-react-constant-elements/
    plugins.push(transformReactConstantElements);
    if (options.styled) {
      plugins.push([styledComponents, { ssr: true }]);
    }
  }
  // TRANSFORM RUNTIME:
  // -----------------------------------------------------------------------------
  // Use helpers, but not polyfills, in a way that omits duplication.
  // For polyfills better use polyfill.io or another more sophisticated solution.
  plugins.push([
    transformRuntimePlugin,
    {
      useESModules: options.modules === false,
      helpers: options.rtHelpers,
      regenerator: options.regen,
      polyfill: options.polyfill,
      useBuiltIns: options.useBuiltIns,
    },
  ]);
  return {
    // Babel basic configuration
    comments: options.comments,
    compact: true,
    minified: options.minified,

    // Whether to enable source maps
    sourceMaps: options.sourceMaps,

    // And all the previously built lists of presets and plugins
    presets,
    plugins,
  };
}
