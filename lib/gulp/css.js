const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const rfs = require('rfs');
const cssnano = require('cssnano');
const stylelint = require('gulp-stylelint');
const {cosmiconfigSync} = require('cosmiconfig');
const postcss = require('gulp-postcss');
const loadPostCSSConfig = require('postcss-load-config');
const sass = require('gulp-sass');
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const plumber = require('gulp-plumber');
const fiber = require('fibers');
const configs = require('./configs.js');
const through = require('through2');

sass.compiler = require('sass');

// CSS task
async function css() {
  let tasks = [];

  await configs.then(configurations => {
    for (const config of configurations) {
      tasks = [
        ...tasks,
        ...config.scss.map(({src, dest}) => {
          return cssCompile({src, dest, cwd: config.cwd});
        })
      ];
    }
  });

  return Promise.all(tasks);
}

async function getPostCSSConfiguration(cwd) {
  try {
    // Get PostCSS config from user
    return await loadPostCSSConfig({}, cwd, {});
  } catch (error) { // eslint-disable-line unicorn/prefer-optional-catch-binding,no-unused-vars
    // Catch no config found from postcss-load-config in order to set default
    // values for our PostCSS instance.
    if (process.env.NODE_ENV === 'production') {
      return {plugins: [rfs(), autoprefixer(), cssnano()]};
    }

    return {plugins: [rfs(), autoprefixer()]};
  }
}

function saveOriginalfile() {
  return through.obj((file, enc, cb) => {
    // Save original file
    if (process.argv.includes('--fix')) {
      file.original = file._contents.toString('utf8');
    }

    cb(null, file);
  });
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

      // Enable linting if configured
      const stylelintConfig = cosmiconfigSync('stylelint').search(cwd);
      if (stylelintConfig) {
        stream = stream.pipe(saveOriginalfile()
        )
          .pipe(stylelint({
            fix: process.argv.includes('--fix'),
            reporters: [
              {
                formatter: process.argv.includes('--verbose') ? 'verbose' : 'string',
                config: stylelintConfig.config,
                console: true
              }
            ]
          }))
          .pipe(gulpIf(file => process.argv.includes('--fix') && file._contents.toString('utf8') !== file.original, gulp.dest(file => file._base))); // Update fixed version differs
      }

      // Init sourcemaps
      if (process.env.NODE_ENV !== 'production') {
        stream = stream.pipe(sourcemaps.init());
      }

      // We better check for .scss and .sass extentions, but use this for backwards compatibility with <= v0.3.1
      if (!src.endsWith('.css')) {
        stream = stream.pipe(sass({outputStyle: 'expanded', fiber}));
      }

      // Apply PostCSS plugins
      stream = stream.pipe(postcss(plugins, options));

      // Write sourcemaps
      if (process.env.NODE_ENV !== 'production') {
        stream = stream.pipe(sourcemaps.write('.'));
      }

      stream = stream.pipe(gulp.dest(dest));

      if (browserSync !== false) {
        stream.pipe(browserSync.stream({match: '**/*.css'}));
      }

      stream.on('end', resolve);
    })
  );
}

module.exports = {css, cssCompile};
