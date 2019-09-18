const chalk = require('chalk');

function getErrorMessage() {
  const error = [];
  error.push('Please pass the correct argument to buildozer. Valid arguments are:');
  error.push(`- ${chalk.bold('build')}: Compile & minify`);
  error.push(`- ${chalk.bold('watch')}: Compile and watch for changes`);
  error.push(`- ${chalk.bold('config')}: Export path config`);
  error.push(`- ${chalk.bold('css')}: Compile only the CSS`);
  error.push(`- ${chalk.bold('js')}: Compile only the javascript`);
  error.push(`- ${chalk.bold('js-concat')}: Merge all .js files in concat folder`);
  error.push(`- ${chalk.bold('img')}: Minify the images`);
  error.push(`- ${chalk.bold('svg-sprite')}: Generate svg sprite`);
  error.push(`- ${chalk.bold('clean')}: Clean all destination folders`);
  error.push(`- ${chalk.bold('copy')}: Copy files defined in .buildozerrc`);
  return chalk.red(`\n${error.join('\n')}`);
}

function error() {
  throw new Error(getErrorMessage());
}

module.exports = error;
