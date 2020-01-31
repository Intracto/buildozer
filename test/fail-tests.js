#!/usr/bin/env node

const {exec} = require('child_process');
const chalk = require('chalk');

exec('npm run fail-stylelint', error => {
  if (!error) {
    throw new Error('`npm run fail-stylelint` should fail but doesn\'t.');
  }

  console.log(`${chalk.green('✓')}  Failtest succeeded.`);
});
