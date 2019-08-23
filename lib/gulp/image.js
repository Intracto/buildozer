const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');

let config = {};
let plumber = null;
let gulp = null;

// CSS task
function img(cb) {
  config.img.forEach(img => {
    imgCompile(config.src_base_path + img.src, config.dest_base_path + img.dest);
  });
  cb();
}

// Optimize Images
function imgCompile(src, dest) {
  return gulp
    .src(src)
    .pipe(plumber())
    .pipe(newer(dest))
    .pipe(
      imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest(dest));
}

// Use config and return clean function
module.exports = function (c, g, p) {
  gulp = g;
  config = c;
  plumber = p;
  return {img, imgCompile};
};
