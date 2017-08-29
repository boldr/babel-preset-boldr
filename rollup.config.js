import { relative, isAbsolute, dirname } from 'path';
import babel from 'rollup-plugin-babel';
import rebase from 'rollup-plugin-rebase';
import cjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import jsonPlugin from 'rollup-plugin-json';

const entry = 'src/index.js';
var fileRebase = rebase({
  outputFolder: dirname('lib/babelPresetBoldr.cjs.js'),
  input: entry,
  verbose: true,
});
export default {
  input: entry,
  sourcemap: true,
  name: 'babelPresetBoldr',
  output: {
    file: 'lib/babelPresetBoldr.cjs.js',
    format: 'cjs',
  },
  external(dependency) {
    if (dependency === entry) {
      return false;
    }

    if (fileRebase.isExternal(dependency)) {
      return true;
    }

    if (isAbsolute(dependency)) {
      var relativePath = relative(__dirname, dependency);
      return Boolean(/node_modules/.exec(relativePath));
    }

    return dependency.charAt(0) !== '.';
  },
  plugins: [
    babel({
      babelrc: false,
      runtimeHelpers: false,

      // Remove comments - these are often positioned on the wrong positon after transpiling anyway
      comments: false,

      // Do not include superfluous whitespace characters and line terminators.
      // When set to "auto" compact is set to true on input sizes of >500KB.
      compact: true,

      // Should the output be minified (not printing last semicolons in blocks, printing literal string
      // values instead of escaped ones, stripping () from new when safe)
      minified: true,

      exclude: 'node_modules/**',
      presets: [['env', { modules: false, targets: { node: '6.11.1' }, useBuiltIns: true }]],
      plugins: [['transform-object-rest-spread', { useBuiltIns: true }]],
    }),
    cjs({
      include: ['node_modules/**'],
    }),
    nodeResolve({
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
      jsnext: true,
      module: true,
      main: true,
    }),
    jsonPlugin(),
    fileRebase,
  ],
};
