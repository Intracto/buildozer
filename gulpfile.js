const gulp = require('gulp');
const {argv} = require('yargs');
const configs = require('./lib/gulp/configs.js');

// Get all tasks
const clean = require('./lib/gulp/clean.js');
const copy = require('./lib/gulp/copy.js');
const {css, cssCompile} = require('./lib/gulp/css.js');
const {img, imgCompile, svgSprite} = require('./lib/gulp/image.js');
const {js, jsCompile, jsConcat} = require('./lib/gulp/js.js');

// Watch files
async function watchFiles() {
  await configs.then(configurations => {
    // Only load browserSync when needed
    const browserSync = configurations[0].browsersync.proxy || configurations[0].browsersync.server ? require('browser-sync').create() : false;

    for (const [i, config] of configurations.entries()) {
      for (const item of config.css) {
        // Watch CSS & Sass files, we name the function so that Gulp outputs the correct name
        // Also watch for stylelint changes
        // eslint-disable-next-line func-names
        gulp.watch(item.watch, argv, function css() {
          return cssCompile({src: item.src, dest: item.dest, cwd: config.cwd, browserSync});
        });

        // Compile CSS once at watch startup
        cssCompile({src: item.src, dest: item.dest, cwd: config.cwd});
      }

      for (const j of config.js) {
        // Watch JS files, we name the function so that Gulp outputs the correct name
        // eslint-disable-next-line func-names
        gulp.watch(j.watch, argv, function js() {
          return jsCompile({src: j.src, dest: j.dest, cwd: config.cwd, browserSync});
        });

        // Compile JS once at watch startup
        jsCompile({src: j.src, dest: j.dest, cwd: config.cwd});
      }

      for (const js of config['js-concat']) {
        // Watch JS files which need to be concatenated, we name the function so that Gulp outputs the correct name
        // eslint-disable-next-line func-names
        gulp.watch(js.watch, argv, function concat() {
          return jsConcat({src: js.src, dest: js.dest, js: js.name, browserSync});
        });

        // Concat JS files once at watch startup
        jsConcat({src: js.src, dest: js.dest, name: js.name});
      }

      for (const i of config.img) {
        // Watch for image changes, we name the function so that Gulp outputs the correct name
        // eslint-disable-next-line func-names
        gulp.watch(i.watch, argv, function img() {
          return imgCompile({src: i.src, dest: i.dest, browserSync});
        });

        // Minify images once at watch startup
        imgCompile({src: i.src, dest: i.dest});
      }

      for (const sprite of config['svg-sprite']) {
        // Watch for SVG sprite changes, we name the function so that Gulp outputs the correct name
        // eslint-disable-next-line func-names
        gulp.watch(sprite.watch, argv, function svgSpriteCreate() {
          return svgSprite({src: sprite.src, dest: sprite.dest, name: sprite.name, browserSync});
        });

        // Create SVG sprite once at watch startup
        svgSprite({src: sprite.src, dest: sprite.dest, name: sprite.name});
      }

      if (i === 0 && browserSync !== false) {
        browserSync.init({
          proxy: config.browsersync.proxy,
          server: config.browsersync.server,
          notify: false,
          open: false
        });

        if (config.browsersync.reload) {
          gulp.watch(config.browsersync.reload).on('change', browserSync.reload);
        }
      }
    }
  });
}

function setEnvironment(cb) {
  // Detect env parameter
  for (const arg of process.argv) {
    if (arg.startsWith('--env=')) {
      process.env.NODE_ENV = arg.slice(6);
    }
  }

  // Set to production if env is not set and build is run
  if (process.env.NODE_ENV === undefined && process.argv.includes('build')) {
    process.env.NODE_ENV = 'production';
  }

  cb();
}

// Define complex tasks
const build = gulp.series(setEnvironment, clean, copy, gulp.parallel(css, js, img));
const watch = gulp.series(setEnvironment, clean, copy, watchFiles);

// Export tasks
exports.copy = copy;
exports.img = img;
exports.css = css;
exports.js = js;
exports['js-concat'] = jsConcat;
exports['svg-sprite'] = svgSprite;
exports.clean = clean;
exports.setEnvironment = setEnvironment;
exports.build = build;
exports.watch = watch;
