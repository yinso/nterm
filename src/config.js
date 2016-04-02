import os from 'os';
import mkdirp from 'mkdirp';
import path from 'path';
import fs from 'fs';

class Config {
  constructor () {

  }

  static get defaultConfig () {
    return {
      version: '1',
      terms: [],
      jobs: []
    }
  }

  static initialize (cb) {
    let basePath = path.join(os.homedir(), '.nterm');
    mkdirp(basePath, (err) => {
      if (err)
        return cb(err)
      this.ensureConfigFile(basePath, cb)
    })
  }

  static ensureConfigFile (basePath, cb) {
    let configPath = path.join(basePath, 'default.json');
    fs.stat(configPath, (err, stats) => {
      if (err) {
        fs.writeFile(configPath, JSON.stringify(this.defaultConfig), 'utf8', (err) => {
          if (err)
            return cb(err)
          return cb(null, new Config(this.defaultConfig))
        })
      } else if (stats.isFile()) {
        fs.readFile(configPath, 'utf8', (err, data) => {
          if (err)
            return cb(err)
          try {
            return cb(null, new Config(JSON.parse(data)))
          } catch (e) {
            return cb(e)
          }
        })
      } else {
        return cb(new Error("Config.ensurePath:unknown_config_type"))
      }
    })
  }
}

module.exports = Config;
