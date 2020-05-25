const concat = require('gulp-concat');
const gulp = require('gulp');
const {cosmiconfigSync} = require('cosmiconfig');
const plumber = require('gulp-plumber');
const {babel} = require('@rollup/plugin-babel');
const {eslint} = require('rollup-plugin-eslint');
const {rollup} = require('rollup');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const glob = require('util').promisify(require('glob'));
const {terser} = require('rollup-plugin-terser');
const configs = require('./configs.js');

async function js() {
  let jsTasks = [];
  let jsConcatTasks = [];

  const configurations = await configs.then(configurations => {
    configurations.forEach(config => {
      jsTasks = jsTasks.concat(config.js.map(async js => {
        const files = await glob(js.src, {absolute: true});
        return Promise.all(files.map(async file => jsCompile({src: file, dest: js.dest, cwd: config.cwd})));
      }));
    });
    return configurations;
  });

  await Promise.all(jsTasks).then(() => {
    configurations.forEach(config => {
      jsConcatTasks = jsConcatTasks.concat(config['js-concat'].map(js => {
        return jsConcat({src: js.src, dest: js.dest, name: js.name});
      }));
    });
  });

  return Promise.all(jsConcatTasks);
}

async function generateBundle({src, cwd}) {
  const rollupPlugins = [];

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
  const bundle = await generateBundle({src, cwd});

  if (browserSync) {
    browserSync.watch(bundle.watchFiles).on('change', browserSync.reload);
  }

  return bundle.write({
    dir: dest,
    format: 'cjs',
    sourcemap: process.env.NODE_ENV !== 'production'
  });
}

function jsConcat({src, dest, name, browserSync = false}) {
  return new Promise(
    (async resolve => { // eslint-disable-line no-async-promise-executor
      let stream = gulp.src(src);

      stream = stream
        .pipe(plumber())
        .pipe(concat(name))
        .pipe(gulp.dest(dest));

      if (browserSync !== false) {
        stream.pipe(browserSync.stream({match: '**/*.js'}));
      }

      stream.on('end', resolve);
    })
  );
}

module.exports = {js, jsCompile, jsConcat, generateBundle};
