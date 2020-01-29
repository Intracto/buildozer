const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const rfs = require('rfs');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const loadPostCSSConfig = require('postcss-load-config');
const sass = require('gulp-sass');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const configs = require('./configs.js');

// CSS task
async function css() {
  let tasks = [];

  await configs.then(configurations => {
    configurations.forEach(config => {
      tasks = tasks.concat(config.scss.map(scss => {
        return cssCompile({src: scss.src, dest: scss.dest, cwd: config.cwd});
      }));
    });
  });

  return Promise.all(tasks);
}

async function getPostCSSConfiguration(cwd) {
  try {
    // Get PostCSS config from user
    return await loadPostCSSConfig({}, cwd, {});
  } catch (error) { // eslint-disable-line no-unused-vars
    // Catch no config found from postcss-load-config in order to set default
    // values for our PostCSS instance.
    if (process.env.NODE_ENV === 'production') {
      return {plugins: [rfs(), autoprefixer(), cssnano()]};
    }

    return {plugins: [rfs(), autoprefixer()]};
  }
}

function cssCompile({src, dest, cwd, browserSync = false}) {
  return new Promise(
    (async resolve => { // eslint-disable-line no-async-promise-executor
      const {plugins, options = {}} = await getPostCSSConfiguration(cwd);
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

      if (browserSync !== false) {
        stream = stream.pipe(browserSync.stream({match: '**/*.css'}));
      }

      stream.on('end', resolve);
    })
  );
}

module.exports = {css, cssCompile};
