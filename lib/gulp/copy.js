const c = require('copyfiles');
const glob = require('glob');
const configs = require('./configs.js');

// Copy files & folders
async function copy(cb) {
  let copyLocations = [];
  // Loop over all configurations and get the locations of files which need to be copied
  await configs.then(configurations => {
    configurations.forEach(config => {
      // Skip if no copy config is present
      if (!Array.isArray(config.copy)) {
        return false;
      }

      copyLocations = copyLocations.concat(config.copy);
    });
  });

  if (copyLocations.length === 0) {
    // Return callback if nothing needs to be copied
    cb();
  }

  let locationsProcessed = 0;
  const filesCopied = [];
  return new Promise(
    (() => {
      copyLocations.forEach(location => {
        // Trim the absolute part from the path by calculating the `up` value
        const src = location.src.split('/');
        const dest = location.dest.split('/');
        let up = 0;
        for (const [i, element] of src.entries()) {
          if (element === dest[i]) {
            up++;
          } else {
            break;
          }
        }

        glob(location.src, {}, (err, paths) => {
          if (err) {
            throw err;
          }

          paths.forEach(p => {
            filesCopied.push({
              src: p,
              dest: location.dest
            });
          });
        });

        c([location.src, location.dest], {up}, () => {
          // If the last location is processed
          if (++locationsProcessed === copyLocations.length) {
            if (filesCopied.length > 0) {
              const log = require('fancy-log');
              const chalk = require('chalk');

              // Log all copied
              if (process.argv.includes('--verbose')) {
                const indent = '           '; // Align with gulp output
                let msg = '';
                msg += chalk.cyan('Files copied:');

                filesCopied.forEach(file => {
                  msg += `\n${indent}- ${chalk.bold(file.src)} to\n${indent}  ${chalk.bold(file.dest)}`;
                });
                log(msg);
              } else if (filesCopied.length === 1) {
                log(`${chalk.bold('1 file')} copied.`);
              } else {
                log(`${chalk.bold(`${filesCopied.length} files`)} copied.`);
              }
            }

            // Return callback after all locations are processed
            cb();
          }
        });
      });
    })
  );
}

module.exports = copy;
