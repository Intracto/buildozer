const chalk = require('chalk');

function getErrorMessage() {
  const error = [];
  error.push('Please pass the correct argument to buildozer. Valid arguments are:');
  error.push(`- ${chalk.bold('build')}: Compile & minify`);
  error.push(`- ${chalk.bold('watch')}: Compile and watch for changes`);
  error.push(`- ${chalk.bold('config')}: Export path config`);
  error.push(`- ${chalk.bold('css')}: Compile only the CSS`);
  error.push(`- ${chalk.bold('js')}: Compile only the javascript`);
  error.push(`- ${chalk.bold('img')}: Minify the images`);
  return chalk.red(`\n${error.join('\n')}`);
}

function error() {
  throw new Error(getErrorMessage());
}

module.exports = error;
