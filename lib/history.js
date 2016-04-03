'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mv = require('mv');

var _mv2 = _interopRequireDefault(_mv);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var History = function () {
  function History(repl, filePath) {
    _classCallCheck(this, History);

    this.repl = repl;
    this.filePath = filePath;
    this.init();
  }

  _createClass(History, [{
    key: 'init',
    value: function init() {
      var _this = this;

      this.repl.rli.addListener('line', function (code) {
        if (code.trim() != '') {
          _this.append(code, function (err) {
            if (err) console.error('repl.history.append:ERROR', err);
          });
        }
      });
    }
  }, {
    key: 'append',
    value: function append(code, cb) {
      _fs2.default.appendFile(this.filePath, JSON.stringify({ cmd: code, ts: new Date() }) + '\n', 'utf8', cb);
    }
  }, {
    key: 'load',
    value: function load(cb) {
      var _this2 = this;

      _fs2.default.readFile(this.filePath, 'utf8', function (err, data) {
        if (err) return cb(err);
        try {
          data = data.trim().split('\n').join(',');
          var history = JSON.parse('[' + data + ']');
          _this2.repl.rli.history = history.map(function (item) {
            return item.cmd;
          }).reverse();
          _this2.repl.rli.historyIndex = -1;
        } catch (e) {
          return cb(e);
        }
      });
    }
  }, {
    key: 'moveLog',
    value: function moveLog(destPath, cb) {
      var _this3 = this;

      (0, _mv2.default)(this.filePath, destPath, function (err) {
        if (err) return cb(err);
        _this3.filePath = destPath;
        return cb();
      });
    }
  }]);

  return History;
}();

module.exports = History;