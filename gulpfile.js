'use strict';

// Load plugins that are required by multiple tasks
const gulp = require('gulp');
const config = require('./lib/gulp/config.js');

// Only load browserSync when needed
// eslint-disable-next-line import/order
const browserSync = config.browsersync.proxy ? require('browser-sync').create() : false;

// Get all tasks
const clean = require('./lib/gulp/clean.js');
const copy = require('./lib/gulp/copy.js');
const {css, cssCompile} = require('./lib/gulp/css.js');
const {img, imgCompile, svgSprite} = require('./lib/gulp/image.js');
const {js, jsCompile, jsConcat} = require('./lib/gulp/js.js');

// Change working dir back to initial dir
process.chdir(process.env.INIT_CWD);

// Watch files
function watchFiles() {
  config.scss.forEach(scss => {
    const src = config.src_base_path + scss.src;
    const dest = config.dest_base_path + scss.dest;

    // eslint-disable-next-line func-names
    gulp.watch(src, function css() {
      return cssCompile(src, dest, false);
    }).on('change', () => {
      if (browserSync !== false) {
        browserSync.stream({match: '**/*.css'});
      }
    });
    cssCompile(src, dest, false);
  });

  config.js.forEach(js => {
    const src = config.src_base_path + js.src;
    const dest = config.dest_base_path + js.dest;

    // eslint-disable-next-line func-names
    gulp.watch(src, function js() {
      return jsCompile(src, dest, false);
    }).on('change', () => {
      if (browserSync !== false) {
        browserSync.stream({match: '**/*.js'});
      }
    });
    jsCompile(src, dest, false);
  });

  config['js-concat'].forEach(js => {
    const src = config.src_base_path + js.src;
    const dest = config.dest_base_path + js.dest;
    const name = config.dest_base_path + js.name;

    // eslint-disable-next-line func-names
    gulp.watch(src, function concat() {
      return jsConcat(src, dest, name, false);
    }).on('change', () => {
      if (browserSync !== false) {
        browserSync.stream({match: `**/${name}`});
      }
    });
    jsConcat(src, dest, name, false);
  });

  config.img.forEach(img => {
    const src = config.src_base_path + img.src;
    const dest = config.dest_base_path + img.dest;

    // eslint-disable-next-line func-names
    gulp.watch(src, function img() {
      return imgCompile(src, dest);
    }).on('change', () => {
      if (browserSync !== false) {
        browserSync.stream({match: '**/*.{png,jpg,jpeg,gif,svg}'});
      }
    });
    imgCompile(src, dest);
  });

  config['svg-sprite'].forEach(js => {
    const src = config.src_base_path + js.src;
    const dest = config.dest_base_path + js.dest;
    const name = config.dest_base_path + js.name;

    // eslint-disable-next-line func-names
    gulp.watch(src, function svgSpriteCreate() {
      return svgSprite(src, dest, name);
    }).on('change', () => {
      if (browserSync !== false) {
        browserSync.stream({match: '**/*.svg'});
      }
    });
    jsConcat(src, dest, name, false);
  });

  if (browserSync !== false) {
    browserSync.init({
      proxy: config.browsersync.proxy,
      notify: false,
      open: false
    });
  }
}

// Define complex tasks
const build = gulp.series(clean, copy, gulp.parallel(css, js, img));
const watch = gulp.series(clean, copy, watchFiles);

// Export tasks
exports.copy = copy;
exports.img = img;
exports.css = css;
exports.js = js;
exports['js-concat'] = jsConcat;
exports['svg-sprite'] = svgSprite;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
