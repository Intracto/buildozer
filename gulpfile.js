'use strict';

const gulp = require('gulp');
const configs = require('./lib/gulp/configs.js');
const {generateBundle} = require('./lib/gulp/js.js');
const glob = require('util').promisify(require('glob'));

// Get all tasks
const clean = require('./lib/gulp/clean.js');
const copy = require('./lib/gulp/copy.js');
const {css, cssCompile} = require('./lib/gulp/css.js');
const {img, imgCompile, svgSprite} = require('./lib/gulp/image.js');
const {js, jsCompile, jsConcat} = require('./lib/gulp/js.js');

async function getDependencyTree(files, cwd) {
  let dependencyTree = await Promise.all(files.map(async src => {
    const bundle = await generateBundle({src, cwd});
    return bundle.watchFiles;
  }));

  dependencyTree = dependencyTree
    .flat()
    // https://github.com/jlmakes/karma-rollup-preprocessor/issues/30
    .filter(dependency => !dependency.includes('\u0000'));

  return dependencyTree;
}

// Watch files
async function watchFiles() {
  await configs.then(configurations => {
    // Only load browserSync when needed
    const browserSync = configurations[0].browsersync.proxy || configurations[0].browsersync.server ? require('browser-sync').create() : false;

    configurations.forEach((config, i) => {
      config.css.forEach(item => {
        // Watch CSS & Sass files, we name the function so that Gulp outputs the correct name
        // Also watch for stylelint changes
        console.log(item);
        // eslint-disable-next-line func-names
        gulp.watch(item.watch, function css() {
          return cssCompile({src: item.src, dest: item.dest, cwd: config.cwd, browserSync});
        });

        // Compile CSS once at watch startup
        cssCompile({src: item.src, dest: item.dest});
      });

      config.js.forEach(async j => {
        // Watch JS files, we name the function so that Gulp outputs the correct name
        const files = await glob(j.src.join(), {absolute: true});
        const dependencyTree = await getDependencyTree(files, j.cwd);

        // eslint-disable-next-line func-names
        gulp.watch(dependencyTree, function js() {
          return Promise.all(files.map(async file => {
            return jsCompile({
              src: file,
              dest: j.dest,
              cwd: config.cwd,
              browserSync
            });
          }));
        });

        // Compile JS once at watch startup
        await Promise.all(files.map(async file => jsCompile({src: file, dest: j.dest, cwd: config.cwd, browserSync})));
      });

      config['js-concat'].forEach(async js => {
        // Watch JS files which need to be concatenated, we name the function so that Gulp outputs the correct name
        const files = await glob(js.src.join(), {absolute: true});
        const dependencyTree = await getDependencyTree(files, js.cwd);

        // eslint-disable-next-line func-names
        gulp.watch(dependencyTree, function concat() {
          return jsConcat({src: js.src, dest: js.dest, js: js.name, browserSync});
        });

        // Concat JS files once at watch startup
        jsConcat({src: js.src, dest: js.dest, name: js.name});
      });

      config.img.forEach(i => {
        // Watch for image changes, we name the function so that Gulp outputs the correct name
        // eslint-disable-next-line func-names
        gulp.watch(i.watch, function img() {
          return imgCompile({src: i.src, dest: i.dest, browserSync});
        });

        // Minify images once at watch startup
        imgCompile({src: i.src, dest: i.dest});
      });

      config['svg-sprite'].forEach(sprite => {
        // Watch for SVG sprite changes, we name the function so that Gulp outputs the correct name
        // eslint-disable-next-line func-names
        gulp.watch(sprite.watch, function svgSpriteCreate() {
          return svgSprite({src: sprite.src, dest: sprite.dest, name: sprite.name, browserSync});
        });

        // Create SVG sprite once at watch startup
        svgSprite({src: sprite.src, dest: sprite.dest, name: sprite.name});
      });

      if (i === 0 && browserSync !== false) {
        browserSync.init({
          proxy: config.browsersync.proxy,
          server: config.browsersync.server,
          notify: false,
          open: false
        });

        if (config.browsersync.reload) {
          gulp.watch(config.browsersync.reload).on('change', browserSync.reload);
        }
      }
    });
  });
}

function setEnvironment(cb) {
  // Detect env parameter
  process.argv.forEach(arg => {
    if (arg.startsWith('--env=')) {
      process.env.NODE_ENV = arg.slice(6);
    }
  });

  // Set to production if env is not set and build is run
  if (process.env.NODE_ENV === undefined && process.argv.includes('build')) {
    process.env.NODE_ENV = 'production';
  }

  cb();
}

// Define complex tasks
const build = gulp.series(setEnvironment, clean, copy, gulp.parallel(css, js, img));
const watch = gulp.series(setEnvironment, clean, copy, watchFiles);

// Export tasks
exports.copy = copy;
exports.img = img;
exports.css = css;
exports.js = js;
exports['js-concat'] = jsConcat;
exports['svg-sprite'] = svgSprite;
exports.clean = clean;
exports.setEnvironment = setEnvironment;
exports.build = build;
exports.watch = watch;
