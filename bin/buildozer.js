#!/usr/bin/env node

if (process.argv.includes('build') || process.argv.includes('watch') || process.argv.includes('css') || process.argv.includes('img') || process.argv.includes('js') || process.argv.includes('clean')) {
  // Run gulp
  require('../lib/gulp')();
} else if (process.argv.includes('config')) {
  // Run config setup
  require('../lib/config')();
} else {
  // Run error
  require('../lib/error')();
}
