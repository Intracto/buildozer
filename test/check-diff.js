#!/usr/bin/env node

const {exec} = require('child_process');

exec('git status -s', (error, stdout) => {
  if (stdout) {
    exec('git diff', (error, stdout) => {
      console.log(stdout);
      throw new Error('Generated test files differ from git. Diff is logged above.');
    });
  }

  if (error) {
    throw new Error(error);
  }
});
