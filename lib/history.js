'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mv = require('mv');

var _mv2 = _interopRequireDefault(_mv);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _touchp = require('touchp');

var _touchp2 = _interopRequireDefault(_touchp);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_bluebird2.default.promisifyAll(_fs2.default);

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
      var _this2 = this;

      var data = JSON.stringify(obj) + '\n';
      _fs2.default.appendFileAsync(this.filePath, data, 'utf8').then(function () {
        return cb();
      }).catch(function (e) {
        (0, _touchp2.default)(_this2.filePath, function (e) {
          if (e) return cb(e);else {
            return _this2.appendFile(obj, cb);
          }
        });
      });
    }
  }, {
    key: 'log',
    value: function log(code, cb) {
      console.log('History.log', code);
      this.appendFile({ cmd: code, ts: new Date() }, cb);
    }
  }, {
    key: 'load',
    value: function load(cb) {
      var _this3 = this;

      _fs2.default.readFileAsync(this.filePath, 'utf8').then(function (data) {
        var history = JSON.parse('[' + data.trim().split('\n').join(',') + ']');
        _this3.repl.rli.history = history.map(function (item) {
          return item.cmd;
        }).reverse();
        _this3.repl.rli.historyIndex = -1;
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