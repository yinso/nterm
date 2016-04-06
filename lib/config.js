'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _fs = require('./fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mkdirpAsync = _bluebird2.default.promisify(_mkdirp2.default);

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

var Config = function () {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} options.appName - used for appending to the name of the baseDir.
   * @param {string} options.baseDir - defaults to os.homedir()
   * @param {string} options.profile - the name of the profile
   */

  function Config(options) {
    _classCallCheck(this, Config);

    options = _lodash2.default.extend({
      appName: 'config',
      baseDir: _os2.default.homedir(),
      logDir: 'logs',
      profile: 'default',
      configPath: 'config.yaml',
      historyPath: 'history.yaml'
    }, options || {});
    this.options = options;
  }

  _createClass(Config, [{
    key: 'profile',
    get: function get() {
      return this.options.profile;
    }

    /**
     * returns the baseDir of the config file.
     * @property
     */

  }, {
    key: 'baseDir',
    get: function get() {
      return _path2.default.join(this.options.baseDir, '.' + this.options.appName);
    }
  }, {
    key: 'profileDir',
    get: function get() {
      return _path2.default.join(this.baseDir, this.options.profile);
    }
  }, {
    key: 'logDir',
    get: function get() {
      return _path2.default.join(this.profileDir, this.options.logDir);
    }
  }, {
    key: 'profilePath',
    get: function get() {
      return _path2.default.join(this.profileDir, this.options.configPath);
    }
  }, {
    key: 'historyPath',
    get: function get() {
      return _path2.default.join(this.profileDir, this.options.historyPath);
    }
  }]);

  return Config;
}();

_bluebird2.default.promisifyAll(Config.prototype);

module.exports = Config;