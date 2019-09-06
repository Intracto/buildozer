const path = require('path');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const gulpSvgSprite = require('gulp-svg-sprite');

let config = {};
let plumber = null;
let gulp = null;

// CSS task
function img(cb) {
  config.img.forEach(img => {
    imgCompile(config.src_base_path + img.src, config.dest_base_path + img.dest);
  });
  config['svg-sprite'].forEach(svg => {
    svgSprite(config.src_base_path + svg.src, config.dest_base_path + svg.dest, svg.name);
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

function svgSprite(src, dest, name) {
  return gulp
    .src(src)
    .pipe(plumber())
    .pipe(
      imagemin([
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
    .pipe(gulpSvgSprite({
      svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false
      },
      mode: {
        symbol: true
      }
    }))
    // The `svg-sprite` uses an opinionated folder structure we don't want, so we flatten the folder structure:
    .pipe(gulp.dest(file => {
      file.path = path.join(file.base, name);
      return dest;
    }));
}

// Use config and return clean function
module.exports = function (c, g, p) {
  gulp = g;
  config = c;
  plumber = p;
  return {img, imgCompile, svgSprite};
};
