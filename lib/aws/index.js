const Promise = require('bluebird');
const fs      = require('fs');

module.exports = function (region, credentials) {

  this.profile          = credentials.profile ? credentials.profile : null;
  this.accessKeyId      = credentials.accessKeyId ? credentials.accessKeyId : null;
  this.secretAccessKey  = credentials.secretAccessKey ? credentials.secretAccessKey : null;
  this.region           = region;
  this.sdk              = require('aws-sdk');
  var _this             = this;

  this.init = function () {
    if (_this.profile) {
      _this.sdk.config.credentials = new _this.sdk.SharedIniFileCredentials({ profile: _this.profile });
    } else if (_this.accessKeyId && _this.secretAccessKey) {
      _this.sdk.config.credentials = new _this.sdk.Credentials(_this.accessKeyId, _this.secretAccessKey);
    } else {
      throw 'No credentials provided to the AWS SDK, make sure you have either a profile or access key/secret set in your config file';
    }
    _this.sdk.config.update({ region: _this.region });
    _this.initServices();
  };

  this.initServices = function () {
    _this.sts  = new this.sdk.STS();
    _this.s3   = new this.sdk.S3();
    _this.kms  = new this.sdk.KMS();
  };

  this.getAccountId = function() {
    return new Promise(function(resolve, reject) {
      _this.sts.getCallerIdentity({}, function(error, data) {
        if (error) return reject(error);
        resolve(data.Account);
      });
    });
  };

  this.bucketExists = function (name) {
    return new Promise(function (resolve, reject) {
      _this.s3.headBucket({ Bucket: name }, function (err, data) {
        if (err && err.statusCode == 404) {
          return err.statusCode == 404 ? resolve(false) : reject(err);
        }
        return resolve(true);
      });
    });
  };

  this.createEncryptionKey = function (galleryId) {
    return new Promise(function (resolve, reject) {
      let tags = [
        { TagKey: "S3ImageGalleryId", TagValue: galleryId }
      ];
      _this.kms.createKey({ Tags: tags }, function (err, data) {
        if (err) return reject(err);
        return resolve(data.KeyMetadata.KeyId);
      })
    });
  };

  this.encrypt = function (keyId, value) {
    return new Promise(function (resolve, reject) {
      _this.kms.encrypt({ KeyId: keyId, Plaintext: value }, function (err, data) {
        if (err) return reject(err);
        return resolve(data.CiphertextBlob.toString('base64'));
      });
    });
  };

  this.createS3Bucket = function (name, acl, website) {
    website = website === true ? true : false;
    return new Promise(function (resolve, reject) {
      _this.s3.createBucket({ Bucket: name, ACL: acl }, function (err, data) {
        if (err) return reject(err);
        if (website) {
          _this.s3.putBucketWebsite({
            Bucket: name,
            WebsiteConfiguration: {
              ErrorDocument: { Key: 'error.html' },
              IndexDocument: { Suffix: 'index.html' }
            }
          }, function (werr, wdata) {
            if (werr) return reject(werr);
            return resolve({ bucket: data, website: wdata });
          });
        } else {
          return resolve({ bucket: data, website: null });
        }

      });
    });
  };

  this.createStream = function (from, type) {
    switch (type) {
      case 'path':
        return fs.createReadStream(from);
      case 'string':
        let Readable = require('stream').Readable;
        let s = new Readable;
        s.push(from);
        s.push(null);
        return s;
      default:
        throw `Invalid type to create stream: ${type}`
    }
  };

  this.putS3Object = function (bucket, path, data, contentType) {
    return new Promise(function (resolve, reject) {
      _this.s3.putObject({
        Bucket: bucket,
        Key: path,
        Body: data,
        ContentType: contentType || null,
      }, function (err, data) {
        if (err) return reject(err);
        return resolve(data);
      });
    })
  };

  this.getS3Object = function (bucket, path) {
    return new Promise(function (resolve, reject) {
      _this.s3.getObject({ Bucket: bucket, Key: path }, function (err, data) {
        if (err) return reject(err);
        return resolve(data.Body.toString('utf8'));
      });
    });
  }

  this.init();

}
