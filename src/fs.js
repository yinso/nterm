import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import Promise from 'bluebird';

const mkdirpAsync = Promise.promisify(mkdirp)

fs.mkdirp = mkdirp

fs._writeFile = fs.writeFile

fs.writeFile = (filePath, data, options = 'utf8', cb) => {
  let dirname = path.dirname(filePath)
  mkdirp(dirname, (err) => {
    if (err)
      return cb(err)
    fs._writeFile(filePath, data, options, cb)
  })
}

fs._appendFile = fs.appendFile

fs.appendFile = (filePath, data, options = 'utf8', cb) => {
  let dirname = path.dirname(filePath)
  mkdirp(dirname, (err) => {
    if (err)
      return cb(err)
    fs._appendFile(filePath, data, options, cb)
  })
}

Promise.promisifyAll(fs)

module.exports = fs
