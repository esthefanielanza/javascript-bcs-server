
const path = require('path');
const gitPromise = require('simple-git/promise');
const rimraf = require("rimraf");
const fs = require('fs')
const constants = require('./constants');
var ncp = require('ncp').ncp;

function isDirectory(source) {
  return fs.lstatSync(source).isDirectory();
}

function getDirectories(source) {
  return isDirectory(source) && fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)
}

function copyDirectory(from, to) {
  return new Promise((resolve, reject) => {
    ncp(from, to, function (err) {
      if (err) {
        console.error(err);
        reject(err);
      }
      resolve();
     });
  })
}

async function checkoutToVersion(dir, version) {
  const gitRepo = gitPromise(dir);
  await gitRepo.checkout(version);
  console.info(`Checkout to version ${version}`);
}

function deleteFile(dir) {
  fs.existsSync(dir) && rimraf.sync(path.resolve(dir));
}

function createCloneDirectory(folder) {
  deleteFile(constants.REPOS);

  const cloneDirectory = `${constants.REPOS}/${folder}`;
  console.log('will clone to', cloneDirectory);
  if(!fs.existsSync(constants.REPOS)) fs.mkdirSync(constants.REPOS);
  if(fs.existsSync(cloneDirectory)) deleteFile(cloneDirectory)

  fs.mkdirSync(cloneDirectory);
  fs.mkdirSync(cloneDirectory.replace('newer', 'older'));

  return path.resolve(cloneDirectory);
}

async function cloneRepo(url, folder) {
  try {
    console.info('Cloning started');

    const cloneDirectory = createCloneDirectory(folder);
    console.log('created directory', url);
    await gitPromise(cloneDirectory).clone(url);
    console.log('finished cloning');
    return getDirectories(cloneDirectory)[0];
  } catch(e) {
    console.error(e);
  }
}

module.exports = {
  cloneRepo,
  deleteFile,
  checkoutToVersion,
  copyDirectory
};