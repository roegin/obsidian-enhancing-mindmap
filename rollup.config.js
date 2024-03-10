import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-css-only';

const isProd = (process.env.BUILD === 'production');

const banner = 
`/*
THIS IS A GENERATED/BUNDLED FILE BY ROLLUP
if you want to view the source visit the plugins github repository
*/
`;

export default {
  input: 'src/main.ts',
  output: {
    dir: '.',
    sourcemap: false,
    sourcemapExcludeSources: isProd,
    format: 'cjs',
    exports: 'default',
    banner,
  },

  external: ['obsidian'],
  plugins: [
    typescript({
      // 仅包括 TypeScript 文件
      include: ['**/*.ts'],
      // 排除 JavaScript 文件
      exclude: ['**/*.js']
    }),
    nodeResolve({browser: true}),
    commonjs(),
    css({ output: 'bundle.css' })
  ]
};