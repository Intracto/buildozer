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
function css() {
  const tasks = config.scss.map(scss => {
    return cssCompile({src: config.src_base_path + scss.src, dest: config.dest_base_path + scss.dest});
  });

  return Promise.all(tasks);
}

async function getPostCSSConfiguration() {
  try {
    // Get PostCSS config from user
    return await loadPostCSSConfig();
  } catch (error) {
    // Catch no config found from postcss-load-config in order to set default
    // values for our PostCSS instance.
    if (process.env.NODE_ENV === 'production') {
      return {plugins: [rfs(), autoprefixer(), cssnano()]};
    }

    return {plugins: [rfs(), autoprefixer()]};
  }
}

async function cssCompile({src, dest, browserSync = false}) {
  const {plugins, options = {}} = await getPostCSSConfiguration();
  let stream = gulp
    .src(src);

  // Prevent errors from aborting task when files are being watched
  if (process.argv.includes('watch')) {
    stream = stream.pipe(plumber());
  }

  if (process.env.NODE_ENV === 'production') {
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
