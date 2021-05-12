const rimraf = require('rimraf');
const configs = require('./configs.js');

// Clean generated folders
async function clean(cb) {
  const folders = [];

  await configs.then(configurations => {
    for (const config of configurations) {
      // Add all dest files/folders to folders array
      for (const type of Object.values(config)) {
        if (Array.isArray(type)) {
          for (const value of type) {
            folders.push(value.dest);
          }
        }
      }
    }
  });

  // And delete them
  // Use a Promise so that the next Gulp task only starts when this one is ended
  return new Promise(
    (() => {
      rimraf(`{${folders.join(',')}}`, {}, cb);
    })
  );
}

module.exports = clean;
