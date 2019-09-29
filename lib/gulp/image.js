const path = require('path');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const gulpSvgSprite = require('gulp-svg-sprite');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const config = require('./config.js');

// CSS task
function img(cb) {
  config.img.forEach(img => {
    imgCompile({src: config.src_base_path + img.src, dest: config.dest_base_path + img.dest});
  });
  config['svg-sprite'].forEach(svg => {
    svgSprite({src: config.src_base_path + svg.src, dest: config.dest_base_path + svg.dest, name: svg.name});
  });
  cb();
}

// Optimize Images
function imgCompile({src, dest, browserSync = false}) {
  let stream = gulp
    .src(src);

  // Prevent errors from aborting task when files are being watched
  if (process.argv.includes('watch')) {
    stream = stream.pipe(plumber());
  }

  stream = stream.pipe(newer(dest))
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
    );

  stream = stream.pipe(gulp.dest(dest));

  return browserSync === false ? stream : stream.pipe(browserSync.stream({match: '**/*.{png,jpg,jpeg,gif,svg}'}));
}

function svgSprite({src, dest, name, browserSync = false}) {
  let stream = gulp
    .src(src);

  // Prevent errors from aborting task when files are being watched
  if (process.argv.includes('watch')) {
    stream = stream.pipe(plumber());
  }

  stream = stream.pipe(
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
    }));

  // The `svg-sprite` uses an opinionated folder structure we don't want, so we flatten the folder structure:
  stream = stream.pipe(gulp.dest(file => {
    file.path = path.join(file.base, name);
    return dest;
  }));

  return browserSync === false ? stream : stream.pipe(browserSync.stream({match: '**/*.svg'}));
}

module.exports = {img, imgCompile, svgSprite};
