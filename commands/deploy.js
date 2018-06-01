const inquirer  = require('inquirer')
const winston   = require('winston')
const config    = require('config')
const fs        = require('fs')
const path      = require('path')
const AwsLib    = require('../lib/aws')

let aws     = null
let deploy  = {
  galleryId: null,
  encryptionKeyId: config.aws.encryptionKeyId || null,
  users: config.security.users,
  buckets: {
    data: null,
    app: null
  }
}

exports.command = 'deploy [options]'
exports.desc    = 'deploys a new gallery, or makes changes to an existing gallery\n' +
                  'node . deploy [--update-passwords=[comma-delimited usernames to update]]'

exports.handler = (argv) => {

  try {
    winston.info(`Initializing the AWS library for the ${config.aws.region} region`)
    aws = new AwsLib(config.aws.region, config.aws.credentials)
  } catch (error) {
    winston.error(error)
    process.exit(1)
  }

  aws.getAccountId().then((accountId) => {
    deploy.galleryId = config.id.replace(/ACCOUNT_ID/g, accountId)
    winston.info(`Starting deploy for gallery: ${deploy.galleryId}`)
    return aws.bucketExists(deploy.galleryId)
  }).then((exists) => {
    if (!exists) {
      return create(argv)
    } else {
      return update(argv)
    }
  }).catch((error) => {
    winston.error(error)
    process.exit(1)
  })

}

const setPassword = (username) => {
  let password = null
  return inquirer.prompt({
    name: 'password',
    type: 'password',
    message: `Enter the password for ${username}: `
  }).then((response) => {
    if (response.password === '') {
      winston.warn("The password can't be blank")
      return setPassword(username)
    }
    password = response.password
    return inquirer.prompt({
      name: 'passwordConfirm',
      type: 'password',
      message: 'And confirm the password by typing it again: '
    })
  }).then((response) => {
    if (password !== response.passwordConfirm) {
      winston.warn("Password entries don't match")
      return setPassword(username)
    }
  }).then(() => {
    return aws.encrypt(deploy.encryptionKeyId, password)
  }).then((encrypted) => {
    for (let i = 0; i < deploy.users.length; i++) {
      if (deploy.users[i].username == username) {
        deploy.users[i].password = encrypted
      }
    }
    return username
  })
}

const createEncryptionKey = () => {
  if (deploy.encryptionKeyId === null) {
    winston.info('Creating a new encryption key in KMS for the gallery password to use')
    return aws.createEncryptionKey(deploy.galleryId)
  } else {
    winston.info('Using configured KMS encryption key')
    return Promise.resolve()
  }
}

const writeDeployJson = () => {
  winston.info('Saving deployment metadata to the gallery data bucket')
  return aws.putS3Object(deploy.galleryId, 'deploy.json', JSON.stringify(deploy, null, 0), 'application/json')
}

const create = (argv) => {
  return createEncryptionKey().then((encryptionKeyId) => {
    if (encryptionKeyId) deploy.encryptionKeyId = encryptionKeyId
    let promises = []
    for (let i = 0; i < deploy.users.length; i++) {
      promises.push(setPassword(deploy.users[i].username))
    }
    return Promise.all(promises)
  }).then((result) => {
    winston.info('Creating a bucket for gallery data and images')
    return aws.createS3Bucket(deploy.galleryId, 'private')
  }).then((result) => {
    deploy.buckets.data = result.bucket.Location
    winston.info('Creating a website bucket for the image gallery app')
    return aws.createS3Bucket(deploy.galleryId + '-app', 'public-read', true)
  }).then((result) => {
    deploy.buckets.app = result.bucket.Location
    return writeDeployJson()
  }).then((result) => {
    return update(argv)
  })
}

const update = (argv) => {
  return aws.getS3Object(deploy.galleryId, 'deploy.json').then((data) =>{
    deploy = JSON.parse(data)
    if (argv['update-passwords'] && argv['update-passwords'] !== '') {
      let updateUsernames = argv['update-passwords'].split(',').map((username) => {
        return username.trim()
      })
      let promises = []
      for (let i = 0; i < deploy.users.length; i++) {
        if (updateUsernames.indexOf(deploy.users[i].username) >= 0) {
          promises.push(setPassword(deploy.users[i].username))
        }
      }
      return Promise.all(promises)
    }
  }).then((updated) => {
    if (updated instanceof Array && updated.length > 0) {
      return writeDeployJson()
    }
    console.log(deploy)
  })
}
