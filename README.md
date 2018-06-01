# S3 Image Gallery

![S3I](public/img/icons/apple-touch-icon-76x76.png)

_A super-simple serverless image gallery deployed inside AWS_

### What you need to deploy your gallery

1. A clone or fork of this repo
2. [NodeJS](https://nodejs.org/) >= 8.x
3. An AWS account, and either a [named profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-multiple-profiles.html) set up on your machine, or an [access key/secret pair](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys). The related IAM user must have administrator privileges in the AWS account.

### Creating your gallery

1. Create a configuration file for your gallery in `config/[your gallery config file name].js`. Refer to `config/default.js` for available configuration options. Your config file will override those defaults. Only set the values you wish to override.
2. Switch to using your config: `node . use [your gallery config file name]`
3. Deploy it: `node . deploy`. That's it, fun!
