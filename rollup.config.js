import pkg from './package.json';
import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import shebang from 'rollup-plugin-add-shebang';

export default {
  input: 'src/battery-prompter.js',
  output: {
    file: pkg.main,
    format: 'cjs'
  },
  plugins: [
    // commonjs(),
    nodeResolve(),
    // terser(),
    shebang({include: [pkg.main]})
  ]
};