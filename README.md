# babel-preset-boldr

Babel preset for [Boldr](https://github.com/strues/boldr).   

`babel-plugin-universal-import` and `babel-plugin-styled-components` are included and enabled by default. If you don't need them,
they can be disabled by passing `universal: false` and/or `styled: false` to the preset's options.


### Options
```javascript
const defaults = {
  // log output to the console
  verbose: false,
  // es modules enabled/disabled -- accepts: commonjs, false, umd, etc
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
  styled: true,
  universal: true,
}
```

**Browser default options**:    
```json
[
  ["boldr", {
    "verbose": false,
    "modules": false,
    "useBuiltIns": true,
    "targets": { "browsers": "last 2 versions"}
  }]
]
```

**Node default options**:   
```json
[
  ["boldr", {
    "verbose": false,
    "modules": false,
    "useBuiltIns": true,
    "targets": { "node": "current"}
  }]
]
```

**Included Presets:**

- [`babel-preset-env`](https://github.com/babel/babel-preset-env)  
- [`babel-preset-react`](https://github.com/babel/babel/tree/master/packages/babel-preset-react)  

**Included Plugins:**  
- [`fast-async`](https://github.com/MatAtBread/fast-async)    
- [`babel-plugin-syntax-dynamic-import`](https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-dynamic-import)  
- [`babel-plugin-syntax-flow`](https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-flow)  
- [`babel-plugin-transform-class-properties`](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-class-properties)  
- [`babel-plugin-transform-decorators-legacy`](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy)  
- [`babel-plugin-transform-object-rest-spread`](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-object-rest-spread)  
- [`babel-plugin-transform-react-jsx`](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-jsx)  
- [`babel-plugin-transform-flow-strip-types`](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-flow-strip-types)
- [`babel-plugin-dynamic-import-node`](https://github.com/airbnb/babel-plugin-dynamic-import-node)  

**Production - React:**  

- [`babel-plugin-transform-react-constant-elements`](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-constant-elements)  
- [`babel-plugin-transform-react-inline-elements`](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-inline-elements)  
- [`babel-plugin-transform-react-remove-prop-types`](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types)

**Development - React:**  

- [`babel-plugin-transform-react-jsx-self`](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-jsx-self)  
- [`babel-plugin-transform-react-jsx-source`](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-jsx-source)  
