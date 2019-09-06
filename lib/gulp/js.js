const babel = require('gulp-babel');
const terser = require('gulp-terser');
const presetEnv = require('@babel/preset-env');
const concat = require('gulp-concat');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const config = require('./config.js');

function js(cb) {
  config.js.forEach(js => {
    jsCompile(config.src_base_path + js.src, config.dest_base_path + js.dest, true);
  });

  config['js-concat'].forEach(js => {
    jsConcat(config.src_base_path + js.src, config.dest_base_path + js.dest, js.name, true);
  });
  cb();
}

function jsCompile(src, dest, minified) {
  let stream = gulp
    .src(src)
    .pipe(plumber())
    .pipe(babel({
      presets: [presetEnv]
    }));

  if (minified) {
    stream = stream.pipe(terser());
  }

  return stream.pipe(gulp.dest(dest));
}

function jsConcat(src, dest, name, minified) {
  let stream = gulp.src(src)
    .pipe(plumber())
    .pipe(babel({
      presets: [presetEnv]
    }))
    .pipe(concat(name));

  if (minified) {
    stream = stream.pipe(terser());
  }

  return stream.pipe(gulp.dest(dest));
}

module.exports = {js, jsCompile, jsConcat};
