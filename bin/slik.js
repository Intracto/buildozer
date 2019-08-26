#!/usr/bin/env node

if (process.argv.includes('build') || process.argv.includes('watch') || process.argv.includes('css') || process.argv.includes('img') || process.argv.includes('js') || process.argv.includes('clean')) {
  require('../lib/gulp')();
} else if (process.argv.includes('config')) {
  require('../lib/config')();
} else {
  console.log('No build');
}
