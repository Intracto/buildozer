const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const rfs = require('rfs');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const config = require('./config.js');

// CSS task
function css(cb) {
  config.scss.forEach(scss => {
    cssCompile(config.src_base_path + scss.src, config.dest_base_path + scss.dest, true);
  });
  cb();
}

function cssCompile(src, dest, minified) {
  let stream = gulp
    .src(src)
    .pipe(plumber());

  if (minified) {
    stream = stream
      .pipe(sass({outputStyle: 'compressed'}))
      .pipe(postcss([rfs(), autoprefixer(), cssnano()]));
  } else {
    stream = stream
      .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'expanded'}))
      .pipe(postcss([rfs(), autoprefixer()]))
      .pipe(sourcemaps.write('.'));
  }

  return stream.pipe(gulp.dest(dest));
}

module.exports = {css, cssCompile};
