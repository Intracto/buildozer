const chalk = require('chalk');
const yargs = require('yargs');

function error() {
  console.error(chalk.red('❌ Please pass the correct argument to buildozer.'));
}

module.exports = error;
