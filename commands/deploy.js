const inquirer  = require('inquirer');
const winston   = require('winston');
const config    = require('config');
const fs        = require('fs');
const path      = require('path');
const awsLib    = require('../lib/aws');

let aws     = null;
let deploy  = {
  galleryId: null,
  encryptionKeyId: config.aws.encryptionKeyId || null,
  users: config.security.users,
  buckets: {
    data: null,
    app: null
  }
};

exports.command = 'deploy [options]';
exports.desc    = 'deploys a new gallery, or makes changes to an existing gallery\n' +
                  'node . deploy [--update-passwords=[comma-delimited usernames to update]]';

/*
Order of operation for creating resources:

1. See if bucket exists with ID
  a. if not, ask setup questions
  b. if so, proceed to 2
2. Create and enable KMS key, if applicable
3. Create/update bucket-specific user
4. Create/update buckets

*/
exports.handler = function (argv) {

  try {
    winston.info(`Initializing the AWS library for the ${config.aws.region} region`);
    aws = new awsLib(config.aws.region, config.aws.credentials);
  } catch (error) {
    winston.error(error);
    process.exit(1);
  }

  aws.getAccountId().then(function (accountId) {
    deploy.galleryId = config.id.replace(/ACCOUNT_ID/g, accountId);
    winston.info(`Using config for gallery: ${deploy.galleryId}`);
    return aws.bucketExists(deploy.galleryId);
  }).then(function (exists) {
    if (!exists) {
      return create(argv);
    } else {
      return update(argv);
    }
  }).catch(function (error) {
    winston.error(error);
    process.exit(1);
  });

};

const setPassword = function (username) {
  let password = null;
  return inquirer.prompt({
    name: 'password',
    type: 'password',
    message: `Enter the password for ${username}: `
  }).then(function (response) {
    if (response.password === '') {
      winston.warn("The password can't be blank");
      return setPassword(username);
    }
    password = response.password;
    return inquirer.prompt({
      name: 'passwordConfirm',
      type: 'password',
      message: 'And confirm the password by typing it again: '
    });
  }).then(function (response) {
    if (password !== response.passwordConfirm) {
      winston.warn("Password entries don't match");
      return setPassword(username);
    }
  }).then(function () {
    return aws.encrypt(deploy.encryptionKeyId, password);
  }).then(function (encrypted) {
    for (let i = 0; i < deploy.users.length; i++) {
      if (deploy.users[i].username == username) {
        deploy.users[i].password = encrypted;
      }
    }
    return username;
  });
};

const createEncryptionKey = function () {
  if (deploy.encryptionKeyId === null) {
    winston.info('Creating a new encryption key in KMS for the gallery password to use');
    return aws.createEncryptionKey(deploy.galleryId);
  } else {
    winston.info('Using configured KMS encryption key');
    return Promise.resolve();
  }
};

const writeDeployJson = function () {
  winston.info('Saving deployment metadata to the gallery data bucket');
  return aws.putS3Object(deploy.galleryId, 'deploy.json', JSON.stringify(deploy, null, 0), 'application/json');
}

const create = function (argv) {
  return createEncryptionKey().then(function (encryptionKeyId) {
    if (encryptionKeyId) deploy.encryptionKeyId = encryptionKeyId;
    let promises = [];
    for (let i = 0; i < deploy.users.length; i++) {
      promises.push(setPassword(deploy.users[i].username));
    }
    return Promise.all(promises);
  }).then(function (result) {
    winston.info('Creating a bucket for gallery data and images');
    return aws.createS3Bucket(deploy.galleryId, 'private');
  }).then(function (result) {
    deploy.buckets.data = result.bucket.Location;
    winston.info('Creating a website bucket for the image gallery app');
    return aws.createS3Bucket(deploy.galleryId + '-app', 'public-read', true);
  }).then(function (result) {
    deploy.buckets.app = result.bucket.Location;
    return writeDeployJson();
  }).then(function (result) {
    return update(argv);
  });
};

const update = function (argv) {
  return aws.getS3Object(deploy.galleryId, 'deploy.json').then(function (data) {
    deploy = JSON.parse(data);
    if (argv['update-passwords'] && argv['update-passwords'] !== '') {
      let updateUsernames = argv['update-passwords'].split(',').map(function (username) {
        return username.trim();
      });
      let promises = [];
      for (let i = 0; i < deploy.users.length; i++) {
        if (updateUsernames.indexOf(deploy.users[i].username) >= 0) {
          promises.push(setPassword(deploy.users[i].username));
        }
      }
      return Promise.all(promises);
    }
  }).then(function (updated) {
    if (updated instanceof Array && updated.length > 0) {
      return writeDeployJson();
    }
  });
};
