const fs = require('fs');
const yaml = require('js-yaml');

// Get config if file exists, otherwise return empty config
function getConfig(path) {
  try {
    return yaml.safeLoad(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    return {};
  }
}

function config() {
  // Merge default options with custom options
  return Object.assign(getConfig(require.resolve('./../../.slikrc')), getConfig(`${process.env.INIT_CWD}/.slikrc`));
}

module.exports = config;

