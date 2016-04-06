import os from 'os';
import mkdirp from 'mkdirp';
import fs from './fs';
import path from 'path';
import _ from 'lodash';
import Promise from 'bluebird';


const mkdirpAsync = Promise.promisify(mkdirp)

/**
 * Represents the session object.
 *
 * Since is for command line program for individual users, the following is the guide.
 *
 * The location of config is in $HOME/.<program_name>/
 *
 * There can be multiple sessions inside the location - users can load different sessions.
 *
 * The default session is called "default". Each session is a directory.
 *
 * The configuration is stored at $HOME/.<program_name>/<session>/config.yml
 *
 * History is stored at $HOME/.<program_name>/<session>/history.yml
 *
 * Logs (multiple - for easier access) will be stored at $HOME/.<program_name>/<session>/log/<timestamp>.log
 *
 */
class Config {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} options.appName - used for appending to the name of the baseDir.
   * @param {string} options.baseDir - defaults to os.homedir()
   * @param {string} options.profile - the name of the profile
   */
  constructor (options) {
    options = _.extend({
      appName: 'config',
      baseDir: os.homedir(),
      logDir: 'logs',
      profile: 'default',
      configPath: 'config.yaml',
      historyPath: 'history.yaml'
    }, options || {});
    this.options = options;
  }

  get profile () {
    return this.options.profile;
  }

  /**
   * returns the baseDir of the config file.
   * @property
   */
  get baseDir () {
    return path.join(this.options.baseDir, '.' + this.options.appName)
  }

  get profileDir () {
    return path.join(this.baseDir, this.options.profile)
  }

  get logDir () {
    return path.join(this.profileDir, this.options.logDir)
  }

  get profilePath () {
    return path.join(this.profileDir, this.options.configPath)
  }

  get historyPath () {
    return path.join(this.profileDir, this.options.historyPath)
  }

}

Promise.promisifyAll(Config.prototype)

module.exports = Config;
