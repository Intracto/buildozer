#!/usr/bin/env node
const path = require('path');
const packageVersion = require('../package.json').version;
const {cosmiconfigSync} = require('cosmiconfig');

const buildozerRcVersion = cosmiconfigSync('buildozer').load(path.resolve('./lib/.buildozerrc')).config.version;

if (packageVersion !== buildozerRcVersion) {
  const chalk = require('chalk');

  console.log(`Package version: ${chalk.bold(packageVersion)}`);
  console.log(`Buildozer version: ${chalk.red.bold(buildozerRcVersion)}`);

  throw new Error(chalk.red('Package version and buildozer version are not in sync.'));
}
