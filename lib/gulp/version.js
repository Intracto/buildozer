const configs = require('./configs.js');
const {glob} = require('glob');
const hasha = require('hasha');
const fs = require('fs');

const extensionsToVersion = ['.css', '.js'];

// Version assets before copying them
async function versionAssets(resolve) {
  const versionTasks = [];
  await configs.then(configurations => {
    configurations.forEach(config => {
      if (config.manifestPath === undefined) {
        // Generate manifest per defined task
        for (const subTask of Object.values(config)) {
          if (Array.isArray(subTask)) {
            versionTasks.concat(subTask.filter(subTaskConfig => subTaskConfig.manifestPath !== undefined).map(subTaskConfig => {
              return generateManifest(subTaskConfig.dest, subTaskConfig.manifestPath);
            }));
          }
        }
      } else {
        // Generate one big manifest
        versionTasks.push(generateManifest(config.manifestSource, config.manifestPath));
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

    const subTasks = [];

    for (const fullPath of files) {
      subTasks.push(generateVersionedFileAndLog(fullPath, srcDir, entries));
    }

    await Promise.all(subTasks);

    dumpToManifest(entries, manifestPath);
  });
}

async function generateVersionedFileAndLog(fullPath, srcDir, entryLog) {
  const versionedFile = await generateVersionedFile(fullPath);
  // Trim down absolute paths and record them
  const relativeSource = fullPath.replace(srcDir, '');
  entryLog[relativeSource] = versionedFile.replace(srcDir, '');
}

async function generateVersionedFile(fullPath) {
  const hash = await hasha.fromFile(fullPath, {algorithm: 'md5'});
  let versionedFileName = fullPath;
  for (const extension of extensionsToVersion) {
    versionedFileName = versionedFileName.replace(extension, `.${hash}${extension}`);
  }

  fs.copyFile(fullPath, versionedFileName, err => {
    if (err) {
      throw err;
    }
  });
  return versionedFileName;
}

function createManifest(manifestPath) {
  fs.writeFile(manifestPath, '{}', err => {
    if (err) {
      throw err;
    }
  });
}

function dumpToManifest(newEntries, targetPath) {
  fs.readFile(targetPath, (err, data) => {
    if (err) {
      throw err;
    }

    const currentEntries = JSON.parse(data);
    Object.assign(currentEntries, newEntries);
    fs.writeFile(targetPath, JSON.stringify(currentEntries), err => {
      if (err) {
        throw err;
      }
    });
  });
}

module.exports = {versionAssets};
