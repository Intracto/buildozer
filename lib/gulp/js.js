const babel = require('gulp-babel');
const terser = require('gulp-terser');
const presetEnv = require('@babel/preset-env');
const concat = require('gulp-concat');
const gulp = require('gulp');
const {cosmiconfigSync} = require('cosmiconfig');
const eslint = require('gulp-eslint');
const plumber = require('gulp-plumber');
const configs = require('./configs.js');

async function js() {
  let jsTasks = [];
  let jsConcatTasks = [];

  const configurations = await configs.then(configurations => {
    configurations.forEach(config => {
      jsTasks = jsTasks.concat(config.js.map(js => {
        return jsCompile({src: js.src, dest: js.dest, cwd: config.cwd});
      }));
    });
    return configurations;
  });

  await Promise.all(jsTasks).then(() => {
    configurations.forEach(config => {
      jsConcatTasks = jsConcatTasks.concat(config['js-concat'].map(js => {
        return jsConcat({src: js.src, dest: js.dest, name: js.name});
      }));
    });
  });

  return Promise.all(jsConcatTasks);
}

function jsCompile({src, dest, cwd, browserSync = false}) {
  return new Promise(
    (async resolve => { // eslint-disable-line no-async-promise-executor
      let stream = gulp
        .src(src);

      // Prevent errors from aborting task when files are being watched
      if (process.argv.includes('watch')) {
        stream = stream.pipe(plumber());
      }

      // Enable linting if configured
      const eslintConfig = cosmiconfigSync('eslint').search(cwd);
      if (eslintConfig) {
        stream = stream.pipe(eslint())
          .pipe(eslint.format())
          .pipe(eslint.failAfterError());
      }

      stream = stream.pipe(babel({
        presets: [presetEnv]
      }));

      if (process.env.NODE_ENV === 'production') {
        stream = stream.pipe(terser());
      }

      stream = stream.pipe(gulp.dest(dest));

      if (browserSync !== false) {
        stream = stream.pipe(browserSync.stream({match: '**/*.js'}));
      }

      stream.on('end', resolve);
    })
  );
}

function jsConcat({src, dest, name, browserSync = false}) {
  return new Promise(
    (async resolve => { // eslint-disable-line no-async-promise-executor
      let stream = gulp.src(src);

      // Prevent errors from aborting task when files are being watched
      if (process.argv.includes('watch')) {
        stream = stream.pipe(plumber());
      }

      stream = stream.pipe(plumber())
        .pipe(babel({
          presets: [presetEnv]
        }))
        .pipe(concat(name));

      if (process.env.NODE_ENV === 'production') {
        stream = stream.pipe(terser());
      }

      stream = stream.pipe(gulp.dest(dest));

      if (browserSync !== false) {
        stream = stream.pipe(browserSync.stream({match: '**/*.js'}));
      }

      stream.on('end', resolve);
    })
  );
}

module.exports = {js, jsCompile, jsConcat};
