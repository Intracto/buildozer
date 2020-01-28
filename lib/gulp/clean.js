const rimraf = require('rimraf');
const configs = require('./configs.js');

// Clean generated folders
async function clean(cb) {
  const folders = [];

  await configs.then(configurations => {
    configurations.forEach(config => {
      // Add all dest files/folders to folders array
      Object.values(config).forEach(type => {
        if (Array.isArray(type)) {
          type.forEach(value => {
            folders.push(value.dest);
          });
        }
      });
    });
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
