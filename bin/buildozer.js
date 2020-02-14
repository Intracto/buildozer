#!/usr/bin/env node
const updateNotifier = require('update-notifier');
const argsInclude = require('../lib/args-include');
const pkg = require('../package.json');

updateNotifier({pkg}).notify();

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
