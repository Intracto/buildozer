const config = require('./config.js');

// Copy files & folders
function copy(cb) {
  // Skip if no copy config is present
  if (!Array.isArray(config.copy)) {
    cb();
    return false;
  }

  const c = require('copy');

  const fileList = [];
  let locationsProcessed = 0;

  // Add all dest files/folders to folders array
  config.copy.forEach(location => {
    c(config.src_base_path + location.src, config.dest_base_path + location.dest, (err, files) => {
      if (err) {
        throw err;
      }

      // Store all files in an array
      files.forEach(file => {
        fileList.push({
          src: file.history[0],
          dest: file.history[1]
        });
      });

      // If the last location is processed
      if (++locationsProcessed === config.copy.length) {
        if (fileList.length > 0) {
          const log = require('fancy-log');
          const chalk = require('chalk');

          // Log all copied
          if (process.argv.includes('--verbose')) {
            const indent = '           '; // Align with gulp output
            let msg = '';
            msg += chalk.cyan('Files copied:');

            fileList.forEach(file => {
              msg += `\n${indent}- ${chalk.bold(file.src)} to\n${indent}  ${chalk.bold(file.dest)}`;
            });
            log(msg);
          } else if (fileList.length === 1) {
            log(`${chalk.bold('1 file')} copied.`);
          } else {
            log(`${chalk.bold(`${fileList.length} files`)} copied.`);
          }
        }

        // Return callback after all locations are processed
        cb();
      }
    });
  });
}

module.exports = copy;
