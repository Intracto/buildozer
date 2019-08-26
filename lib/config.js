const destPath = `${process.env.INIT_CWD}/.slikrc`;
const fs = require('fs');
const chalk = require('chalk');

function copyFile(message) {
  fs.copyFile(require.resolve('./../.slikrc'), destPath, err => {
    if (err) {
      throw err;
    }

    console.log(message);
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

    rl.question(`${chalk.bold('.slikrc')} file already exists, do you want to override it? ${chalk.yellow('(yes/no)')} `, answer => {
      if (['y', 'yes'].includes(answer)) {
        copyFile(`${chalk.green('✓')} ${chalk.bold('.slikrc')} file overridden with default config.`);
      }

      rl.close();
    });
  } else {
    copyFile(`${chalk.green('✓')} ${chalk.bold('.slikrc')} file created.`);
  }
}

module.exports = config;
