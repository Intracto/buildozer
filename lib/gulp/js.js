const {cosmiconfigSync} = require('cosmiconfig');
const {babel} = require('@rollup/plugin-babel');
const {eslint} = require('rollup-plugin-eslint');
const {rollup} = require('rollup');
const path = require('path');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const glob = require('util').promisify(require('glob'));
const {terser} = require('rollup-plugin-terser');
const configs = require('./configs.js');
const multi = require('@rollup/plugin-multi-entry');

async function js() {
  let jsTasks = [];
  let jsConcatTasks = [];

  const configurations = await configs.then(configurations => {
    configurations.forEach(config => {
      jsTasks = jsTasks.concat(config.js.map(async js => {
        const src = await resolveAllAssetsFromArray(js.src);
        return jsCompile({src, dest: js.dest, cwd: config.cwd});
      }));
    });
    return configurations;
  });

  await Promise.all(jsTasks).then(() => {
    configurations.forEach(config => {
      jsConcatTasks = jsConcatTasks.concat(config['js-concat'].map(async js => {
        const src = await resolveAllAssetsFromArray(js.src);
        return jsConcat({src, dest: js.dest, name: js.name, cwd: config.cwd});
      }));
    });
  });

  return Promise.all(jsConcatTasks);
}

async function resolveAllAssetsFromArray(assets) {
  return (await Promise.all(assets.map(async asset => glob(asset)))).flat();
}

async function generateBundle({src, cwd, plugins = []}) {
  const rollupPlugins = plugins;

  // Bundle third party imported modules
  rollupPlugins.push(resolve.default());

  // Auto convert CommonJS modules to ES6, so they can be included in a Rollup bundle
  rollupPlugins.push(commonjs());

  // If user has an eslint configuration, load Eslint.
  const hasEslintConfig = Boolean(cosmiconfigSync('eslint').search(cwd));
  if (hasEslintConfig) {
    rollupPlugins.push(eslint({fix: process.argv.includes('--fix')}));
  }

  // Decide whether to load a default babel preset if there is no babel configuration found
  const hasBabelConfig = Boolean(cosmiconfigSync('babel').search(cwd));
  const babelConfig = {babelHelpers: 'bundled'};
  if (!hasBabelConfig) {
    babelConfig.presets = ['@babel/preset-env'];
  }

  rollupPlugins.push(babel(babelConfig));

  // Terser (minify)
  rollupPlugins.push(terser());

  return rollup({
    input: src,
    plugins: rollupPlugins
  });
}

async function jsCompile({src, dest, cwd, browserSync = false}) {
  const files = await glob(src.join(), {absolute: true});
  if (files.length === 0) {
    return;
  }

  const bundle = await generateBundle({src, cwd});

  if (browserSync) {
    browserSync.watch(bundle.watchFiles).on('change', browserSync.reload);
  }

  return bundle.write({
    dir: dest,
    format: 'amd',
    sourcemap: process.env.NODE_ENV !== 'production'
  });
}

async function jsConcat({src, dest, name, browserSync = false, cwd}) {
  // Abort if there are no files
  const files = await glob(src.join(), {absolute: true});
  if (files.length === 0) {
    return;
  }

  // Allow multiple entry points to a single output
  const plugins = [multi()];

  const bundle = await generateBundle({src, cwd, plugins});

  if (browserSync) {
    browserSync.watch(bundle.watchFiles).on('change', browserSync.reload);
  }

  return bundle.write({
    file: path.join(dest, name),
    format: 'amd',
    sourcemap: process.env.NODE_ENV !== 'production'
  });
}

module.exports = {js, jsCompile, jsConcat, generateBundle};
