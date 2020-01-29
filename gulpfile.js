'use strict';

// Load plugins that are required by multiple tasks
const gulp = require('gulp');
const configs = require('./lib/gulp/configs.js');

// Get all tasks
const clean = require('./lib/gulp/clean.js');
const copy = require('./lib/gulp/copy.js');
const {css, cssCompile} = require('./lib/gulp/css.js');
const {img, imgCompile, svgSprite} = require('./lib/gulp/image.js');
const {js, jsCompile, jsConcat} = require('./lib/gulp/js.js');

// Change working dir back to initial dir
process.chdir(process.env.INIT_CWD);

// Watch files
async function watchFiles() {
  await configs.then(configurations => {
    // Only load browserSync when needed
    const browserSync = configs[0].browsersync.proxy || configs[0].browsersync.server ? require('browser-sync').create() : false;

    configurations.forEach((config, i) => {
      config.scss.forEach(scss => {
        // Watch CSS & Sass files, we name the function so that Gulp outputs the correct name
        // eslint-disable-next-line func-names
        gulp.watch(scss.src, function css() {
          return cssCompile({src: scss.src, dest: scss.dest, browserSync});
        });

        // Compile CSS once at watch startup
        cssCompile({src: scss.src, dest: scss.dest});
      });

      config.js.forEach(j => {
        // Watch JS files, we name the function so that Gulp outputs the correct name
        // eslint-disable-next-line func-names
        gulp.watch(j.src, function js() {
          return jsCompile({src: j.src, dest: j.dest, browserSync});
        });

        // Compile JS once at watch startup
        jsCompile({src: j.src, dest: j.dest});
      });

      config['js-concat'].forEach(js => {
        // Watch JS files which need to be concatenated, we name the function so that Gulp outputs the correct name
        // eslint-disable-next-line func-names
        gulp.watch(js.src, function concat() {
          return jsConcat({src: js.src, dest: js.dest, js: js.name, browserSync});
        });

        // Concat JS files once at watch startup
        jsConcat({src: js.src, dest: js.dest, js: js.name});
      });

      config.img.forEach(i => {
        // Watch for image changes, we name the function so that Gulp outputs the correct name
        // eslint-disable-next-line func-names
        gulp.watch(i.src, function img() {
          return imgCompile({src: i.src, dest: i.dest, browserSync});
        });

        // Minify images once at watch startup
        imgCompile({src: i.src, dest: i.dest});
      });

      config['svg-sprite'].forEach(sprite => {
        // Watch for SVG sprite changes, we name the function so that Gulp outputs the correct name
        // eslint-disable-next-line func-names
        gulp.watch(sprite.src, function svgSpriteCreate() {
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

function setProduction(cb) {
  process.env.NODE_ENV = 'production';
  cb();
}

// Define complex tasks
const build = gulp.series(setProduction, clean, copy, gulp.parallel(css, js, img));
const watch = gulp.series(clean, copy, watchFiles);

// Export tasks
exports.copy = copy;
exports.img = img;
exports.css = css;
exports.js = js;
exports['js-concat'] = jsConcat;
exports['svg-sprite'] = svgSprite;
exports.clean = clean;
exports.setProduction = setProduction;
exports.build = build;
exports.watch = watch;
