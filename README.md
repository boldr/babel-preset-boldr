# babel-preset-boldr

Babel preset for [Boldr](https://github.com/strues/boldr)

**Browser default options**:    
```json
{
  "debug": false,
  "loose": false,
  "modules": false,
  "targets": {
    "uglify": true,
    "browsers": ["> .5% in US", "last 1 versions"],
  },
  "exclude": ["transform-regenerator", "transform-async-to-generator"],
  "useBuiltIns": true
},
```

**Node default options**:   
```json
{
  "debug": false,
  "loose": false,
  "modules": false,
  "targets": {
    "node": 8,
  },
  "exclude": ["transform-regenerator", "transform-async-to-generator"],
  "useBuiltIns": true
},
```

**Modifying the options**:    
```json
{
  "presets": [["boldr/node", {
    "targets": {
      "node": 7
    }
    }]]
}
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
