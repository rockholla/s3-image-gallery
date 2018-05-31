module.exports = {
  /*
  ACCOUNT_ID used in the id will be replace with the AWS account ID at runtime
  */
  id: "ACCOUNT_ID-s3-image-gallery",
  aws: {
    region: "us-east-1",
    credentials: {
      profile: null,
      accessKeyId: null,
      secretAccessKey: null,
    },
    /*
    If you include a KMS key ID here, the deploy process will use it instead of trying to create on at runtime
    */
    encryptionKeyId: null,
  },
  images: {
    accepted: [
      "image/png",
      "image/jpg",
      "image/gif",
    ],
  },
  security: {
    /*
    public-read: an editor must sign in to upload, anyone can view without singing in
    public-read-write: anyone can view and upload images without signing in
    private: everyone must sign in to view or upload images
    */
    type: "public-read",
    users: [
      /*
      in the following form:
      { username: "user01", role: "editor" }
      available roles: viewer, editor
      passwords are set at deploy-time
      */
      { username: "editor", role: "editor" },
    ],
  },
  log: {
    level: "info",
    colors: {
      debug: "blue",
      verbose: "cyan",
      info: "green",
      warn: "yellow",
      error: "red",
    },
    file: false,
    console: true,
  },
};
