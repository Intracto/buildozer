// Forked from https://github.com/dlmanning/gulp-sass
// Ditched the node-sass dependency
const PluginError = require('plugin-error');
const through = require('through2');
const path = require('path');
const applySourceMap = require('vinyl-sourcemaps-apply');

const PLUGIN_NAME = 'gulp-sass';

const gulpSass = () => through.obj((file, enc, cb) => {
  if (file.isNull()) {
    return cb(null, file);
  }

  if (file.isStream()) {
    return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
  }

  if (path.basename(file.path).indexOf('_') === 0) {
    return cb();
  }

  if (file.contents.length === 0) {
    file.path = file.path.replace(/\.[^/.]+$/, '.css');
    return cb(null, file);
  }

  const options = {};
  options.data = file.contents.toString();

  // We set the file path here so that libsass can correctly resolve import paths
  options.file = file.path;
  options.outputStyle = 'expanded';

  // Ensure `indentedSyntax` is true if a `.sass` file
  if (path.extname(file.path) === '.sass') {
    options.indentedSyntax = true;
  }

  options.includePaths = [path.dirname(file.path)];

  // Generate Source Maps if plugin source-map present
  if (file.sourceMap) {
    options.sourceMap = file.path;
    options.omitSourceMapUrl = true;
    options.sourceMapContents = true;
  }

  /// ///////////////////////////
  // Handles returning the file to the stream
  /// ///////////////////////////
  const filePush = sassObject => {
    let sassMap;
    let sassMapFile;
    let sassFileSrc;
    let sassFileSrcPath;
    let sourceFileIndex;

    // Build Source Maps!
    if (sassObject.map) {
      // Transform map into JSON
      sassMap = JSON.parse(sassObject.map.toString());
      // Grab the stdout and transform it into stdin
      sassMapFile = sassMap.file.replace(/^stdout$/, 'stdin');
      // Grab the base file name that's being worked on
      sassFileSrc = file.relative;
      // Grab the path portion of the file that's being worked on
      sassFileSrcPath = path.dirname(sassFileSrc);
      if (sassFileSrcPath) {
        // Prepend the path to all files in the sources array except the file that's being worked on
        sourceFileIndex = sassMap.sources.indexOf(sassMapFile);
        sassMap.sources = sassMap.sources.map((source, index) => {
          return index === sourceFileIndex ? source : path.join(sassFileSrcPath, source);
        });
      }

      // Remove 'stdin' from souces and replace with filenames!
      sassMap.sources = sassMap.sources.filter(src => src !== 'stdin' && src);

      // Replace the map file with the original file name (but new extension)
      sassMap.file = sassFileSrc.replace(/\.[^/.]+$/, '.css');
      // Apply the map
      applySourceMap(file, sassMap);
    }

    file.contents = sassObject.css;
    file.path = file.path.replace(/\.[^/.]+$/, '.css');

    cb(null, file);
  };

  /// ///////////////////////////
  // Handles error message
  /// ///////////////////////////
  const errorM = error => {
    const chalk = require('chalk');
    const filePath = (error.file === 'stdin' ? file.path : error.file) || file.path;
    const relativePath = path.relative(process.cwd(), filePath);
    const message = [chalk.underline(relativePath), error.formatted].join('\n');

    error.messageFormatted = message;
    error.messageOriginal = error.message;
    error.message = message;
    error.relativePath = relativePath;

    return cb(new PluginError(PLUGIN_NAME, error));
  };

  const callback = (error, object) => {
    if (error) {
      return errorM(error);
    }

    filePush(object);
  };

  gulpSass.compiler = require('sass');
  gulpSass.compiler.render(options, callback);
});

// Log errors nicely
gulpSass.logError = function (error) {
  const message = new PluginError('sass', error.messageFormatted).toString();
  process.stderr.write(`${message}\n`);
  this.emit('end');
};

module.exports = gulpSass;
