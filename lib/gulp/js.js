const babel = require('gulp-babel');
const terser = require('gulp-terser');
const presetEnv = require('@babel/preset-env');
const concat = require('gulp-concat');

let config = {};
let plumber = null;
let gulp = null;

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
  if (minified) {
    return gulp
      .src(src)
      .pipe(plumber())
      .pipe(babel({
        presets: [presetEnv]
      }))
      .pipe(terser())
      .pipe(gulp.dest(dest));
  }

  return gulp
    .src(src)
    .pipe(plumber())
    .pipe(babel({
      presets: [presetEnv]
    }))
    .pipe(gulp.dest(dest));
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

// Use config and return clean function
module.exports = function (c, g, p) {
  gulp = g;
  config = c;
  plumber = p;
  return {js, jsCompile, jsConcat};
};
