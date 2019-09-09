const del = require('del');
const config = require('./config.js');

// Clean generated folders
function clean() {
  const folders = [];

  // Add all dest files/folders to folders array
  Object.values(config).forEach(type => {
    if (Array.isArray(type)) {
      type.forEach(value => {
        folders.push(config.dest_base_path + value.dest);
      });
    }
  });

  // And delete them
  return del(folders);
}

module.exports = clean;
