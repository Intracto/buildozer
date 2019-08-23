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
    const src = config.src_base_path + scss.src;
    const dest = config.dest_base_path + scss.dest;
    gulp.watch(src, () => cssCompile(src, dest, false));
    cssCompile(src, dest, false);
  });

  config.js.forEach(js => {
    const src = config.src_base_path + js.src;
    const dest = config.dest_base_path + js.dest;
    gulp.watch(src, () => jsCompile(src, dest, false));
    jsCompile(src, dest, false);
  });

  config.img.forEach(img => {
    const src = config.src_base_path + img.src;
    const dest = config.dest_base_path + img.dest;
    gulp.watch(src, () => imgCompile(src, dest));
    imgCompile(src, dest);
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
