const configs = require('./configs.js');
const path = require('path');
const {glob} = require("glob");
const hasha = require('hasha');
const fs = require('fs');

const extensionsToVersion = ['.css', '.js']

// Version assets before copying them
async function versionAssets(resolve) {
  const versionTasks = [];
  await configs.then(configurations => {
    configurations.forEach(config => {
        if (config.manifest_path !== undefined) {
          // Generate one big manifest
          const dest = path.join(config.cwd, config.dest_base_path)
          versionTasks.push(generateManifest(dest, config.manifest_path));
        } else {
          // Generate manifest per defined task
          for (const subTask of Object.values(config)) {
            if (Array.isArray(subTask)) {
              versionTasks.concat(subTask.filter((subTaskConfig) => subTaskConfig.manifest_path !== undefined).map((subTaskConfig) => {
                return generateManifest(subTaskConfig.dest, subTaskConfig.manifest_path)
              }))
            }
          }

        }
      }
    );
  });
  await Promise.all(versionTasks);
  resolve();
}

async function generateManifest(srcDir, manifestPath) {
  const entries = {};
  createManifest(manifestPath);

  glob(`${srcDir}/**/*+(${extensionsToVersion.join('|')})`, {}, async (err, files) => {
    if (err) {
      throw err;
    }

    for (const fullPath of files) {
      const versionedFile = await generateVersionedFile(fullPath)
      // Trim down absolute paths and record them
      const relativeSource = fullPath.replace(srcDir, '');
      entries[relativeSource] = versionedFile.replace(srcDir, '');
    }
    dumpToManifest(entries, manifestPath);
  });
}

async function generateVersionedFile(fullPath) {
  const hash = await hasha.fromFile(fullPath, {algorithm: 'md5'});
  let versionedFileName = fullPath;
  for (const extension of extensionsToVersion) {
    versionedFileName = versionedFileName.replace(extension, `.${hash}${extension}`);
  }
  fs.copyFile(fullPath, versionedFileName, () => {
  });
  return versionedFileName;
}

function createManifest(manifestPath) {
  fs.writeFile(manifestPath, '{}', (err) => {
    if (err)
      throw err;
  })

}

function dumpToManifest(newEntries, targetPath) {
  fs.readFile(targetPath, (err, data) => {
    if (err)
      throw err;

    const currentEntries = JSON.parse(data);
    Object.assign(currentEntries,newEntries);
    fs.writeFile(targetPath, JSON.stringify(currentEntries), (err) => {
      if (err)
        throw err;
    });
  })
}

module.exports = {versionAssets};
