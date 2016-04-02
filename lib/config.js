'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Config = function () {
  function Config() {
    _classCallCheck(this, Config);
  }

  _createClass(Config, null, [{
    key: 'initialize',
    value: function initialize(cb) {
      var _this = this;

      var basePath = _path2.default.join(_os2.default.homedir(), '.nterm');
      (0, _mkdirp2.default)(basePath, function (err) {
        if (err) return cb(err);
        _this.ensureConfigFile(basePath, cb);
      });
    }
  }, {
    key: 'ensureConfigFile',
    value: function ensureConfigFile(basePath, cb) {
      var _this2 = this;

      var configPath = _path2.default.join(basePath, 'default.json');
      _fs2.default.stat(configPath, function (err, stats) {
        if (err) {
          _fs2.default.writeFile(configPath, JSON.stringify(_this2.defaultConfig), 'utf8', function (err) {
            if (err) return cb(err);
            return cb(null, new Config(_this2.defaultConfig));
          });
        } else if (stats.isFile()) {
          _fs2.default.readFile(configPath, 'utf8', function (err, data) {
            if (err) return cb(err);
            try {
              return cb(null, new Config(JSON.parse(data)));
            } catch (e) {
              return cb(e);
            }
          });
        } else {
          return cb(new Error("Config.ensurePath:unknown_config_type"));
        }
      });
    }
  }, {
    key: 'defaultConfig',
    get: function get() {
      return {
        version: '1',
        terms: [],
        jobs: []
      };
    }
  }]);

  return Config;
}();

module.exports = Config;