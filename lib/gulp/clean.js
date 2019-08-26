const del = require('del');

let config = {};

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

// Use config and return clean function
module.exports = function (c) {
  config = c;
  return clean;
};
