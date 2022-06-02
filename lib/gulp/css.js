const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const cleanCSS = require('gulp-clean-css');
const stylelint = require('gulp-stylelint');
const {cosmiconfigSync} = require('cosmiconfig');
const postcss = require('gulp-postcss');
const loadPostCSSConfig = require('postcss-load-config');
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const plumber = require('gulp-plumber');
const sass = require('./sass.js');
const configs = require('./configs.js');
const through = require('through2');

async function css() {
  let tasks = [];

  await configs.then(configurations => {
    for (const config of configurations) {
      tasks = [
        ...tasks,
        ...config.css.map(({src, dest}) => {
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
  } catch {
    // Catch no config found from postcss-load-config in order to set default
    return {plugins: [autoprefixer()]};
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
      let {plugins, options = {}} = await getPostCSSConfiguration(cwd);

      // Add autoprefixer if it wasn't added
      if (!process.argv.includes('--disable-autoprefixer') && !plugins.some(plugin => plugin.postcssPlugin === 'autoprefixer')) {
        plugins.push(autoprefixer());
      } else if (process.argv.includes('--disable-autoprefixer')) {
        plugins = plugins.filter(plugin => plugin.postcssPlugin !== 'autoprefixer');
      }

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

      // Use custom parser for Sass files
      if (src.endsWith('.scss') || src.endsWith('.sass')) {
        stream = stream.pipe(sass());
      }

      // Apply PostCSS plugins
      stream = stream.pipe(postcss(plugins, options));

      // Add CleanCSS
      // We add it in both production and development, so there aren't any unexpected differences between them.
      stream = stream.pipe(cleanCSS({
        // Remove all whitespaces in production, but keep it readable during development.
        format: process.env.NODE_ENV === 'production' ? false : 'beautify',

        // Only enable safe rules.
        level: 1
      }));

      // Add sourcemaps when not building for production.
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
