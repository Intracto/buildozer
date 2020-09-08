const path = require('path');
const glob = require('glob');
const {cosmiconfigSync} = require('cosmiconfig');

// Get config if file exists, otherwise return empty config
function getConfig(path) {
  const cosmicConfig = cosmiconfigSync('buildozer').search(path);
  return cosmicConfig ? cosmicConfig.config : {};
}

function watchConfigPaths(paths, name, cwd) {
  const dirs = [cwd];
  if (cwd !== process.env.INIT_CWD) {
    dirs.push(process.env.INIT_CWD);
  }

  dirs.forEach(dir => {
    paths.push(path.join(dir, `.${name}rc`));
    paths.push(path.join(dir, `.${name}rc.json`));
    paths.push(path.join(dir, `.${name}rc.yaml`));
    paths.push(path.join(dir, `.${name}rc.yml`));
    paths.push(path.join(dir, `.${name}rc.js`));
    paths.push(path.join(dir, `${name}.config.js`));
  });

  return paths;
}

function processConfig(config, cwd) {
  config.cwd = cwd;

  ['scss', 'js', 'img', 'js-concat', 'svg-sprite', 'copy'].forEach(key => {
    if (config[key]) {
      config[key] = config[key].map(value => {
        const src = path.join(cwd, config.src_base_path, value.src);
        const dest = path.join(cwd, config.dest_base_path, value.dest);
        let watch = [src];

        if (key === 'scss') {
          watch = watchConfigPaths(watch, 'stylelint', cwd);
        } else if (key === 'js') {
          watch = watchConfigPaths(watch, 'eslint', cwd);
        }

        // Convert to absolute paths
        const conf = {
          src,
          watch,
          dest
        };
        if (value.name) {
          conf.name = value.name;
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
  const config = [processConfig({...baseConfig, ...getConfig(process.env.INIT_CWD)}, process.env.INIT_CWD)];

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

