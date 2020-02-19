const path = require('path');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const gulpSvgSprite = require('gulp-svg-sprite');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const configs = require('./configs.js');

// CSS task
async function img() {
  let imgTasks = [];
  let spriteTasks = [];

  await configs.then(configurations => {
    configurations.forEach(config => {
      imgTasks = imgTasks.concat(config.img.map(img => {
        return imgCompile({src: img.src, dest: img.dest});
      }));

      spriteTasks = spriteTasks.concat(config['svg-sprite'].map(svg => {
        return svgSprite({src: svg.src, dest: svg.dest, name: svg.name});
      }));
    });
  });

  return Promise.all(imgTasks.concat(spriteTasks));
}

// Optimize Images
function imgCompile({src, dest, browserSync = false}) {
  return new Promise(
    (resolve => {
      let stream = gulp
        .src(src);

      // Prevent errors from aborting task when files are being watched
      if (process.argv.includes('watch')) {
        stream = stream.pipe(plumber());
      }

      const extension = src.split('.').pop();

      const plugins = (() => {
        switch (extension) {
          case 'gif':
            return imagemin.gifsicle({interlaced: true});
          case 'png':
            return imagemin.optipng({optimizationLevel: 5});
          case 'svg':
            return imagemin.svgo({
              plugins: [
                {
                  removeViewBox: false,
                  collapseGroups: true
                }
              ]
            });
          case 'jpg':
          case 'jpeg':
            return imagemin.mozjpeg({progressive: true});
          default: // Required for backwards compatibility with <= v0.3.1
            return [
              imagemin.gifsicle({interlaced: true}),
              imagemin.mozjpeg({progressive: true}),
              imagemin.optipng({optimizationLevel: 5}),
              imagemin.svgo({
                plugins: [
                  {
                    removeViewBox: false,
                    collapseGroups: true
                  }
                ]
              })
            ];
        }
      })();

      stream = stream.pipe(newer(dest))
        .pipe(
          imagemin([plugins], {
            silent: true
          })
        );

      stream = stream.pipe(gulp.dest(dest));

      if (browserSync !== false) {
        stream = stream.pipe(browserSync.stream({match: `**/*.${extension}`}));
      }

      stream.on('end', resolve);
    })
  );
}

function svgSprite({src, dest, name, browserSync = false}) {
  return new Promise(
    (resolve => {
      let stream = gulp
        .src(src);

      // Prevent errors from aborting task when files are being watched
      if (process.argv.includes('watch')) {
        stream = stream.pipe(plumber());
      }

      stream = stream.pipe(
        imagemin(
          [
            imagemin.svgo({
              plugins: [
                {
                  removeViewBox: false,
                  collapseGroups: true
                }
              ]
            })
          ],
          {
            silent: true
          })
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

      if (browserSync !== false) {
        stream = stream.pipe(browserSync.stream({match: '**/*.svg'}));
      }

      stream.on('end', resolve);
    })
  );
}

module.exports = {img, imgCompile, svgSprite};
