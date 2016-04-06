import fs from './fs'
import path from 'path'
import Promise from 'bluebird'
import jsYaml from 'js-yaml'

class History {
  constructor (repl, filePath) {
    this.repl = repl;
    this.filePath = filePath;
  }

  initialize(cb) {
    if (!this._initialized) {
      this.repl.rli.addListener('line', (code) => {
        if (code.trim() != '') {
          this.log(code, (err) => {
            if (err)
              console.error('repl.history.append:ERROR', err)
          })
        }
      })
      this._initialized = true
      this.load(cb)
    } else {
      return cb()
    }
  }

  appendFile (obj, cb) {
    let data = jsYaml.safeDump([ obj ])
    fs.appendFileAsync(this.filePath, data, 'utf8')
      .then(() => {
        return cb()
      })
      .catch(cb)
  }

  log(code, cb) {
    this.appendFile({cmd: code, ts: new Date()}, cb)
  }

  load (cb) {
    fs.readFileAsync(this.filePath, 'utf8')
      .then((data) => {
        let history = jsYaml.safeLoad(data)
        this.repl.rli.history = history.map((item) => {
          return item.cmd;
        }).reverse()
        this.repl.rli.historyIndex = -1
        cb()
      })
      .catch((e) => {
        cb()
      })
  }

  setFilePath(destPath, cb) {
    this.filePath = destPath;
    this.load(cb)
  }
}

Promise.promisifyAll(History.prototype)

module.exports = History
