'use strict';

// Load plugins
const yaml = require('js-yaml');
const fs = require('fs');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const del = require('del');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');

function getConfig (path) {
	try {
		return yaml.safeLoad(fs.readFileSync(path, 'utf8'));
	} catch (e) {
		return {};
	}
}

// Merge default options with custom options
const config = Object.assign(getConfig(require.resolve('./.slikrc')), getConfig(`${process.env.INIT_CWD}/.slikrc`));

// Change working dir back to initial dir
process.chdir(process.env.INIT_CWD);

// Clean generated folders
function clean() {
	const folders = [];

	// Add all dest files/folders to folders array
	Object.values(config).forEach(function (type) {
		type.forEach(function (value) {
			folders.push(value.dest);
		});
	});

	// And delete them
	return del(folders);
}

// Optimize Images
function images() {
	return gulp
		.src('./assets/src/img/**/*')
		.pipe(newer('./assets/dest/img'))
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
		.pipe(gulp.dest('./assets/dest/img'));
}

// CSS task
function cssMin(cb) {
	config.scss.forEach(function (scss) {
		gulp
			.src(scss.src)
			.pipe(plumber())
			.pipe(sass({}))
			.pipe(postcss([autoprefixer(), cssnano()]))
			.pipe(gulp.dest(scss.dest))
	});
	cb();
}

function css() {
	return gulp
		.src('./assets/src/scss/**/*.scss')
		.pipe(plumber())
		.pipe(sass({outputStyle: 'expanded'}))
		.pipe(postcss([autoprefixer()]))
		.pipe(gulp.dest('./assets/dest/css/'));
}

// Watch files
function watchFiles() {
	gulp.watch('assets/src/scss/**/*', cb => {
		css();
		cb();
	});
	gulp.watch('assets/src/img/**/*', cb => {
		images();
		cb();
	});
}

// Define complex tasks
const build = gulp.series(clean, gulp.parallel(cssMin, images));
const watch = gulp.series(build, watchFiles);

// Export tasks
exports.images = images;
exports.css = css;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
