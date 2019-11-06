const fs = require('fs');
const yaml = require('js-yaml');

// Get config if file exists, otherwise return empty config
function getConfig(path) {
  try {
    return yaml.safeLoad(fs.readFileSync(path, 'utf8'));
  } catch (error) { // eslint-disable-line no-unused-vars
    return {};
  }
}

function config() {
  // Merge default options with custom options
  return Object.assign(getConfig(require.resolve('./../../.buildozerrc')), getConfig(`${process.env.INIT_CWD}/.buildozerrc`));
}

module.exports = config();

