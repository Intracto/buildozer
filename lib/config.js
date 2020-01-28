const destPath = `${process.env.INIT_CWD}/.buildozerrc`;
const fs = require('fs');
const chalk = require('chalk');

function copyFile() {
  fs.copyFile(require.resolve('./../.buildozerrc'), destPath, err => {
    if (err) {
      throw err;
    }
  });
}

function config() {
  // If config file already exists, ask to override
  if (fs.existsSync(destPath)) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${chalk.bold('.buildozerrc')} file already exists, do you want to override it? ${chalk.yellow('(yes/no)')} `, answer => {
      if (['y', 'yes'].includes(answer)) {
        copyFile(`${chalk.green('✓')} ${chalk.bold('.buildozerrc')} file overridden with default config.`);
      }

      rl.close();
    });
  } else {
    copyFile(`${chalk.green('✓')} ${chalk.bold('.buildozerrc')} file created.`);
  }
}

module.exports = config;
