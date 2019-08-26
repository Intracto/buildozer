'use strict';

// Load plugins that are required by multiple tasks
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const config = require('./lib/gulp/config.js')();

// Get all tasks
const clean = require('./lib/gulp/clean.js')(config);
const {css, cssCompile} = require('./lib/gulp/css.js')(config, gulp, plumber);
const {img, imgCompile} = require('./lib/gulp/image.js')(config, gulp, plumber);
const {js, jsCompile} = require('./lib/gulp/js.js')(config, gulp, plumber);

// Change working dir back to initial dir
process.chdir(process.env.INIT_CWD);

// Watch files
function watchFiles() {
  config.scss.forEach(scss => {
    gulp.watch(scss.src, () => cssCompile(scss.src, scss.dest, false));
    cssCompile(scss.src, scss.dest, false);
  });

  config.js.forEach(js => {
    gulp.watch(js.src, () => jsCompile(js.src, js.dest, false));
    jsCompile(js.src, js.dest, false);
  });

  config.img.forEach(img => {
    gulp.watch(img.src, () => imgCompile(img.src, img.dest));
    imgCompile(img.src, img.dest);
  });
}

// Define complex tasks
const build = gulp.series(clean, gulp.parallel(css, js, img));
const watch = gulp.series(clean, watchFiles);

// Export tasks
exports.img = img;
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
