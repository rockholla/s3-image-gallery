const fs = require('fs')

class Shared {

  createStream (from, type) {
    switch (type) {
      case 'path':
        return fs.createReadStream(from)
      case 'string':
        let Readable = require('stream').Readable
        let s = new Readable
        s.push(from)
        s.push(null)
        return s
      default:
        throw `Invalid type to create stream: ${type}`
    }
  }

}

module.exports = new Shared()
