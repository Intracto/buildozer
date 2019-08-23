function gulp() {
  // Use gulpfile from the buildozer module
  process.argv.push('--gulpfile');
  process.argv.push(require.resolve('./../gulpfile.js'));

  require('gulp-cli')();
}

module.exports = gulp;
