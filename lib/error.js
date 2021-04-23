const chalk = require('chalk');

function getErrorMessage() {
  const error = [];
  error.push(
    'Please pass the correct argument to buildozer. Valid arguments are:',
    `- ${chalk.bold('build')}: Compile & minify`,
    `- ${chalk.bold('watch')}: Compile and watch for changes`,
    `- ${chalk.bold('config')}: Export path config`,
    `- ${chalk.bold('css')}: Compile only the CSS`,
    `- ${chalk.bold('js')}: Compile only the javascript`,
    `- ${chalk.bold('js-concat')}: Merge all .js files in concat folder`,
    `- ${chalk.bold('img')}: Minify the images`,
    `- ${chalk.bold('svg-sprite')}: Generate svg sprite`,
    `- ${chalk.bold('clean')}: Clean all destination folders`,
    `- ${chalk.bold('copy')}: Copy files defined in .buildozerrc`
  );
  return chalk.red(`\n${error.join('\n')}`);
}

function error() {
  throw new Error(getErrorMessage());
}

module.exports = error;
