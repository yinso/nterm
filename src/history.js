import mv from 'mv'
import fs from 'fs'
import path from 'path'

class History {
  constructor (repl, filePath) {
    this.repl = repl;
    this.filePath = filePath;
    this.init()
  }

  init() {
    this.repl.rli.addListener('line', (code) => {
      if (code.trim() != '') {
        this.append(code, (err) => {
          if (err)
            console.error('repl.history.append:ERROR', err)
        })
      }
    })
  }

  append(code, cb) {
    fs.appendFile(this.filePath, JSON.stringify({cmd: code, ts: new Date()}) + '\n', 'utf8', cb)
  }

  load (cb) {
    fs.readFile(this.filePath, 'utf8', (err, data) => {
      if (err)
        return cb(err)
      try {
        data = data.trim().split('\n').join(',')
        console.log('History.load', data)
        let history = JSON.parse('[' + data + ']')
        this.repl.rli.history = history.map((item) => {
          return item.cmd;
        }).reverse()
        this.repl.rli.historyIndex = -1;
      } catch (e) {
        return cb(e)
      }
    })
  }

  moveLog (destPath, cb) {
    mv(this.filePath, destPath, (err) => {
      if (err)
        return cb(err);
      this.filePath = destPath;
      return cb();
    })
  }
}

module.exports = History
