const c = require('copy');

let config = {};

// Copy files & folders
function copy(cb) {
  const fileList = [];
  let locationsProcessed = 0;

  // Add all dest files/folders to folders array
  config.copy.forEach(location => {
    c(location.src, location.dest, (err, files) => {
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
          const chalk = require('chalk');
          const indent = '          ';

          console.log(chalk.cyan(`${indent}Files copied:`));

          fileList.forEach(file => {
            console.log(`${indent}- ${chalk.bold(file.src)} to\n${indent}  ${chalk.bold(file.dest)}`);
          });
        }

        // Return callback after all locations are processed
        cb();
      }
    });
  });
}

// Use config and return clean function
module.exports = function (c) {
  config = c;
  return copy;
};
