'use strict';

// Load plugins
const fs = require('fs');
const yaml = require('js-yaml');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const del = require('del');
const gulp = require('gulp');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const presetEnv = require('@babel/preset-env');

let minified = true;

function getConfig(path) {
	try {
		return yaml.safeLoad(fs.readFileSync(path, 'utf8'));
	} catch (error) {
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
	Object.values(config).forEach(type => {
		type.forEach(value => {
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
function css(cb) {
	config.scss.forEach(scss => {
		cssCompile(scss.src, scss.dest);
	});
	cb();
}

function cssCompile(src, dest) {
	const postCssPlugins = minified ? [autoprefixer(), cssnano()] : [autoprefixer()];
	return gulp
		.src(src)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: minified ? 'compressed' : 'expanded'}))
		.pipe(postcss(postCssPlugins))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(dest));
}

function js(cb) {
	config.js.forEach(js => {
		jsCompile(js.src, js.dest);
	});
	cb();
}

function jsCompile(src, dest) {
	return gulp
		.src(src)
		.pipe(plumber())
		.pipe(babel({
			presets: [presetEnv]
		}))
		.pipe(gulp.dest(dest));
}

// Watch files
function watchFiles() {
	minified = false;

	config.scss.forEach(scss => {
		gulp.watch(scss.src, () => {
			return cssCompile(scss.src, scss.dest);
		});
	});

	config.js.forEach(js => {
		gulp.watch(js.src, () => {
			return jsCompile(js.src, js.dest);
		});
	});
}

// Define complex tasks
const build = gulp.series(clean, gulp.parallel(css, js, images));
const watch = gulp.series(build, watchFiles);

// Export tasks
exports.images = images;
exports.css = css;
exports.cssCompile = cssCompile;
exports.js = js;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
