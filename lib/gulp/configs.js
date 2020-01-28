const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const glob = require('glob');

// Get config if file exists, otherwise return empty config
function getConfig(path) {
  try {
    return yaml.safeLoad(fs.readFileSync(path, 'utf8'));
  } catch (error) { // eslint-disable-line no-unused-vars
    // We suppress the error because the default config is used when no config is found
    return {};
  }
}

function processConfig(config, cwd) {
  config.cwd = cwd;

  ['scss', 'js', 'img', 'js-concat', 'svg-sprite', 'copy'].forEach(key => {
    if (config[key]) {
      config[key] = config[key].map(val => {
        // Convert to absolute paths
        const conf = {
          src: path.join(cwd, config.src_base_path, val.src),
          dest: path.join(cwd, config.dest_base_path, val.dest)
        };
        if (val.name) {
          conf.name = val.name;
        }

        return conf;
      });
    }
  });
  return config;
}

async function configs() {
  // Get the default config from the buildozer package
  const baseConfig = getConfig(require.resolve('./../../.buildozerrc'));
  // Merge default config with the config of the current dir if present
  const config = [processConfig({...baseConfig, ...getConfig(`${process.env.PWD}/.buildozerrc`)}, process.env.PWD)];

  // Search for configs if config_search is enabled
  if (config[0].config_search.enabled) {
    await new Promise((resolve, reject) => {
      glob('**/.buildozerrc', {cwd: process.env.INIT_CWD, ignore: config[0].config_search.ignore}, (error, files) => {
        if (error) {
          reject(error);
        } else {
          files.forEach(file => {
            // Skip the config in current dir if present, we already processed this file
            if (file !== '.buildozerrc') {
              config.push(processConfig({...baseConfig, ...getConfig(file)}, path.resolve(`./${file.slice(0, -1 * '.buildozerrc'.length)}`)));
            }
          });
          resolve(files);
        }
      });
    });
  }

  return config;
}

module.exports = configs();

