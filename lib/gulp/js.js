const babel = require('gulp-babel');
const terser = require('gulp-terser');
const presetEnv = require('@babel/preset-env');
const concat = require('gulp-concat');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const config = require('./config.js');

function js() {
  const jsTasks = config.js.map(js => {
    return jsCompile({src: config.src_base_path + js.src, dest: config.dest_base_path + js.dest});
  });

  const jsConcatTasks = config['js-concat'].map(js => {
    return jsConcat({src: config.src_base_path + js.src, dest: config.dest_base_path + js.dest, name: js.name});
  });

  return Promise.all(jsTasks.concat(jsConcatTasks));
}

function jsCompile({src, dest, browserSync = false}) {
  let stream = gulp
    .src(src);

  // Prevent errors from aborting task when files are being watched
  if (process.argv.includes('watch')) {
    stream = stream.pipe(plumber());
  }

  stream = stream.pipe(babel({
    presets: [presetEnv]
  }));

  if (process.env.NODE_ENV === 'production') {
    stream = stream.pipe(terser());
  }

  stream = stream.pipe(gulp.dest(dest));

  return browserSync === false ? stream : stream.pipe(browserSync.stream({match: '**/*.js'}));
}

function jsConcat({src, dest, name, browserSync = false}) {
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

  return browserSync === false ? stream : stream.pipe(browserSync.stream({match: '**/*.js'}));
}

module.exports = {js, jsCompile, jsConcat};
