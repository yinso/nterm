'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _repl = require('repl');

var _repl2 = _interopRequireDefault(_repl);

var _shell = require('./shell');

var _shell2 = _interopRequireDefault(_shell);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _shellParse = require('shell-parse');

var _shellParse2 = _interopRequireDefault(_shellParse);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _history = require('./history');

var _history2 = _interopRequireDefault(_history);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _command = require('./command');

var _command2 = _interopRequireDefault(_command);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Repl = function () {
  function Repl(options) {
    var _this = this;

    _classCallCheck(this, Repl);

    this.shell = new _shell2.default(options);
    var customEval = function customEval(cmd, context, filename, cb) {
      _this.eval(cmd, context, filename, cb);
    };
    this.replServer = _repl2.default.start({
      prompt: '$> ',
      terminal: true,
      useColors: true,
      eval: customEval
    });
    this.historyPath = _path2.default.join(_os2.default.homedir(), '.nterm', 'test.history.log');
    this.history = new _history2.default(this.replServer, this.historyPath);
  }

  _createClass(Repl, [{
    key: 'eval',
    value: function _eval(cmd, context, filename, cb) {
      try {
        var command = _command2.default.build(this.shell, cmd);
        return command.exec(function (err, res) {
          if (err) cb(err);else {
            cb();
          }
        });
      } catch (e) {
        return cb(e);
      }
    }
  }, {
    key: 'init',
    value: function init(cb) {
      this.history.load(cb);
    }
  }]);

  return Repl;
}();

function run(options) {
  _config2.default.initialize(function (err, config) {
    if (err) {
      console.error(err);
      process.exit(-1);
    }
    var shellRepl = new Repl(options);
    shellRepl.init(function (err) {
      if (err) {
        console.error('shell.repl.init.ERROR', err);
        process.exit(-1);
      }
    });
  });
}

module.exports = {
  run: run
};