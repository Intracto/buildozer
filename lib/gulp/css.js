const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const rfs = require('rfs');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const loadPostCSSConfig = require('postcss-load-config');
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

async function getPostCSSConfiguration(minified) {
  try {
    // Get PostCSS config from user
    return await loadPostCSSConfig();
  } catch (error) {
    // Catch no config found from postcss-load-config in order to set default
    // values for our PostCSS instance.
    if (minified) {
      return {plugins: [rfs(), autoprefixer(), cssnano()]};
    }

    return {plugins: [rfs(), autoprefixer()]};
  }
}

function cssCompile(src, dest, minified, browserSync = false) {
  const {plugins, options = {}} = getPostCSSConfiguration(minified);
  let stream = gulp
    .src(src);

  // Prevent errors from aborting task when files are being watched
  if (process.argv.includes('watch')) {
    stream = stream.pipe(plumber());
  }

  if (minified) {
    stream = stream
      .pipe(sass({outputStyle: 'compressed'}))
      .pipe(postcss(plugins, options));
  } else {
    stream = stream
      .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'expanded'}))
      .pipe(postcss(plugins, options))
      .pipe(sourcemaps.write('.'));
  }

  stream = stream.pipe(gulp.dest(dest));

  return browserSync === false ? stream : stream.pipe(browserSync.stream({match: '**/*.css'}));
}

module.exports = {css, cssCompile};
