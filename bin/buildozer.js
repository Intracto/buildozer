#!/usr/bin/env node
const argsInclude = require('../lib/args-include');

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
