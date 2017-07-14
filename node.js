const path = require('path');
const environment = process.env.BABEL_ENV || process.env.NODE_ENV || 'production';

let supportUniversalComponent = false;
let supportLodash = false;
let supportStyledComponents = false;

let universalComponentAvailable = false;

// detect if we have styled-components and babel-plugin-styled-components
// if one of them is missing, throw an error
let styledComponentsAvailable = false;
let lodashAvailable = false;
let babelLodashAvailable = false;
let babelStyledComponentsAvailable = false;
let babelDualImportAvailable = false;
try {
  require.resolve('react-universal-component');
  universalComponentAvailable = true;
  require.resolve('babel-plugin-dual-import');
  babelDualImportAvailable = true;
  supportUniversalComponent = true;
} catch (e) {
  // do not throw if all of them are missing
  if (
    !supportUniversalComponent &&
    (universalComponentAvailable || babelDualImportAvailable)
  ) {
    throw new Error(
      `
  Please install react-universal-component and babel-plugin-dual-import.
  Providing these dependencies is required for the preset to work correctly.
    `,
    );
  }
}
try {
  require.resolve('lodash');
  universalComponentAvailable = true;
  require.resolve('babel-plugin-lodash');
  babelLodashAvailable = true;
  supportLodash = true;
} catch (e) {
  // do not throw if all of them are missing
  if (
    !supportLodash &&
    (lodashAvailable || babelLodashAvailable)
  ) {
    throw new Error(
      `
  Please install lodash and babel-plugin-lodash.
  Providing these dependencies is required for the preset to work correctly.
    `,
    );
  }
}
try {
  require.resolve('styled-components');
  styledComponentsAvailable = true;
  require.resolve('babel-plugin-styled-components');
  babelStyledComponentsAvailable = true;
  supportStyledComponents = true;
} catch (e) {
  if (!supportStyledComponents && (styledComponentsAvailable || babelStyledComponentsAvailable)) {
    throw new Error(
      `
      Please install styled-components and babel-plugin-styled-components.
      You have to provide both in order to support styled-components v2.
    `,
    );
  }
}

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
  if(supportStyledComponents) {
      config.plugins.push(
        [require.resolve('babel-plugin-styled-components'),
        { displayName: environment === 'test' || environment === 'development', ssr: true }]
      )
  }
  if(supportUniversalComponent) {
      config.plugins.push(
        require.resolve('babel-plugin-dual-import')
      )
  }
  if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
      require.resolve('babel-plugin-transform-flow-strip-types')
    );
  }

  return config;
}
