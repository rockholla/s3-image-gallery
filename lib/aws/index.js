const fs = require('fs')

class Aws {

  constructor (region, credentials) {
    this.profile          = credentials.profile || null
    this.accessKeyId      = credentials.accessKeyId || null
    this.secretAccessKey  = credentials.secretAccessKey || null
    this.region           = region
    this.sdk              = require('aws-sdk')
    if (this.profile) {
      this.sdk.config.credentials = new this.sdk.SharedIniFileCredentials({ profile: this.profile })
    } else if (this.accessKeyId && this.secretAccessKey) {
      this.sdk.config.credentials = new this.sdk.Credentials(this.accessKeyId, this.secretAccessKey)
    } else {
      throw 'No credentials provided to the AWS SDK, make sure you have either a profile or access key/secret set in your config file'
    }
    this.sdk.config.update({ region: this.region })
    this.sts  = new this.sdk.STS()
    this.s3   = new this.sdk.S3()
    this.kms  = new this.sdk.KMS()
  }

  getAccountId () {
    return new Promise((resolve, reject) => {
      this.sts.getCallerIdentity({}, (error, data) => {
        if (error) return reject(error)
        resolve(data.Account)
      })
    })
  }

  bucketExists (name) {
    return new Promise((resolve, reject) => {
      this.s3.headBucket({ Bucket: name }, (err, data) => {
        if (err && err.statusCode == 404) {
          return err.statusCode == 404 ? resolve(false) : reject(err)
        }
        return resolve(true)
      })
    })
  }

  createEncryptionKey (galleryId) {
    return new Promise((resolve, reject) => {
      let tags = [
        { TagKey: "S3ImageGalleryId", TagValue: galleryId }
      ]
      this.kms.createKey({ Tags: tags }, (err, data) => {
        if (err) return reject(err)
        return resolve(data.KeyMetadata.KeyId)
      })
    })
  }

  encrypt (keyId, value) {
    return new Promise((resolve, reject) => {
      this.kms.encrypt({ KeyId: keyId, Plaintext: value }, (err, data) => {
        if (err) return reject(err)
        return resolve(data.CiphertextBlob.toString('base64'))
      })
    })
  }

  createS3Bucket (name, acl, website) {
    website = website === true ? true : false
    return new Promise((resolve, reject) => {
      this.s3.createBucket({ Bucket: name, ACL: acl }, (err, data) => {
        if (err) return reject(err)
        if (website) {
          this.s3.putBucketWebsite({
            Bucket: name,
            WebsiteConfiguration: {
              ErrorDocument: { Key: 'error.html' },
              IndexDocument: { Suffix: 'index.html' }
            }
          }, (werr, wdata) => {
            if (werr) return reject(werr);
            return resolve({ bucket: data, website: wdata });
          })
        } else {
          return resolve({ bucket: data, website: null })
        }
      })
    })
  }

  putS3Object (bucket, path, data, contentType) {
    return new Promise((resolve, reject) => {
      this.s3.putObject({
        Bucket: bucket,
        Key: path,
        Body: data,
        ContentType: contentType || null,
      }, (err, data) => {
        if (err) return reject(err)
        return resolve(data)
      })
    })
  }

  getS3Object (bucket, path) {
    return new Promise((resolve, reject) => {
      this.s3.getObject({ Bucket: bucket, Key: path }, (err, data) => {
        if (err) return reject(err)
        return resolve(data.Body.toString('utf8'))
      })
    })
  }

}

module.exports = Aws
