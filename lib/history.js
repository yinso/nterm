'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('./fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var History = function () {
  function History(repl, filePath) {
    _classCallCheck(this, History);

    this.repl = repl;
    this.filePath = filePath;
  }

  _createClass(History, [{
    key: 'initialize',
    value: function initialize(cb) {
      var _this = this;

      if (!this._initialized) {
        this.repl.rli.addListener('line', function (code) {
          if (code.trim() != '') {
            _this.log(code, function (err) {
              if (err) console.error('repl.history.append:ERROR', err);
            });
          }
        });
        this._initialized = true;
        this.load(cb);
      } else {
        return cb();
      }
    }
  }, {
    key: 'appendFile',
    value: function appendFile(obj, cb) {
      var data = _jsYaml2.default.safeDump([obj]);
      _fs2.default.appendFileAsync(this.filePath, data, 'utf8').then(function () {
        return cb();
      }).catch(cb);
    }
  }, {
    key: 'log',
    value: function log(code, cb) {
      this.appendFile({ cmd: code, ts: new Date() }, cb);
    }
  }, {
    key: 'load',
    value: function load(cb) {
      var _this2 = this;

      _fs2.default.readFileAsync(this.filePath, 'utf8').then(function (data) {
        var history = _jsYaml2.default.safeLoad(data);
        _this2.repl.rli.history = history.map(function (item) {
          return item.cmd;
        }).reverse();
        _this2.repl.rli.historyIndex = -1;
        cb();
      }).catch(function (e) {
        cb();
      });
    }
  }, {
    key: 'setFilePath',
    value: function setFilePath(destPath, cb) {
      this.filePath = destPath;
      this.load(cb);
    }
  }]);

  return History;
}();

_bluebird2.default.promisifyAll(History.prototype);

module.exports = History;