const path = require('path');
const glob = require('glob');
const {cosmiconfigSync} = require('cosmiconfig');

// Get config if file exists, otherwise return empty config
function getConfig(path) {
  const cosmicConfig = cosmiconfigSync('buildozer').search(path);
  return cosmicConfig ? cosmicConfig.config : {};
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
  const baseConfig = getConfig(require.resolve('./../../lib/.buildozerrc'));
  // Merge default config with the config of the current dir if present
  const config = [processConfig({...baseConfig, ...getConfig(process.env.PWD)}, process.env.PWD)];

  // Search for configs if config_search is enabled
  if (config[0].config_search.enabled) {
    await new Promise((resolve, reject) => {
      glob('**/{.buildozerrc,.buildozerrc.json,.buildozerrc.yaml,.buildozerrc.yml,.buildozerrc.js,buildozerrc.config.js}', {cwd: process.env.INIT_CWD, ignore: config[0].config_search.ignore}, (error, files) => {
        if (error) {
          reject(error);
        } else {
          files.forEach(file => {
            // Skip the config in current dir if present, we already processed this file
            if (!(file.startsWith('.buildozerrc') || file === 'buildozerrc.config.js')) {
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

