#!/usr/bin/env node

function argsInclude(list) {
  let value = false;
  list.forEach(item => {
    if (process.argv.includes(item)) {
      value = true;
    }
  });
  return value;
}

if (argsInclude(['build', 'watch', 'css', 'img', 'js', 'clean', 'copy', 'js-concat', 'svg-sprite'])) {
  // Run gulp
  require('../lib/gulp')();
} else if (process.argv.includes('config')) {
  // Run config setup
  require('../lib/config')();
} else {
  // Run error
  require('../lib/error')();
}
