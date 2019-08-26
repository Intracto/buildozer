const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');

let config = {};
let plumber = null;
let gulp = null;

// CSS task
function css(cb) {
  config.scss.forEach(scss => {
    cssCompile(scss.src, scss.dest, true);
  });
  cb();
}

function cssCompile(src, dest, minified) {
  if (minified) {
    return gulp
      .src(src)
      .pipe(plumber())
      .pipe(sass({outputStyle: 'compressed'}))
      .pipe(postcss([autoprefixer(), cssnano()]))
      .pipe(gulp.dest(dest));
  }

  return gulp
    .src(src)
    .pipe(plumber()).pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest));
}

// Use config and return clean function
module.exports = function (c, g, p) {
  gulp = g;
  config = c;
  plumber = p;
  return {css, cssCompile};
};
