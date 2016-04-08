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

var _command = require('./command');

var _command2 = _interopRequireDefault(_command);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _process = require('./process');

var _process2 = _interopRequireDefault(_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents the REPL of the shell
 * @param {Object} options
 * @param {string} options.appName - The name of the program. Used for determining the location of the config as well (nterm -> ~/.nterm)
 * @param {string} options.session - the name of the session, defaults to "default"
 */

var Repl = function () {
  function Repl(options) {
    var _this = this;

    _classCallCheck(this, Repl);

    this.config = new _config2.default(options);
    this.shell = new _shell2.default(this.config, {}); // shell will store itself
    var customEval = function customEval(cmd, context, filename, cb) {
      _this.eval(cmd, context, filename, cb);
    };
    this.replServer = _repl2.default.start({
      prompt: '$> ',
      terminal: true,
      useColors: true,
      eval: customEval
    });
    this.shell.readline = this.replServer.rli;
    this.replServer._complete = this.replServer.complete;
    this.replServer.complete = function (line, cb) {
      _this.tabComplete(line, cb);
    };
    this.replServer.defineCommand('session', {
      help: 'Set session to a particular point',
      action: function action(name) {
        _this.setHistory(name, function (err) {
          if (err) {
            _this.replServer.outputStream.write("ERROR: " + err.stack);
            _this.replServer.displayPrompt();
          } else {
            _this.replServer.outputStream.write("session = " + name + "\n");
            _this.replServer.displayPrompt();
          }
        });
      }
    });
    this.replServer.defineCommand('exit', {
      help: 'Exit',
      action: function action() {
        console.log('exit...');
        _this.shutdown(function (e) {
          if (e) {
            console.error(e.stack);
            process.exit(-1);
          } else {
            process.exit(0);
          }
        });
      }
    });
    /*
    process.on('SIGNINT', () => {
      this.shutdown((e) => {
        if (e) {
          console.error(e.stack)
          process.exit(-1)
        } else {
          console.error('bye.')
          process.exit()
        }
      })
    })//*/
    this.replServer.on('SIGINT', function () {
      console.log('SIGINT called');
      _this.shell.handleSignal('SIGINT');
    });
  }

  _createClass(Repl, [{
    key: 'tabComplete',
    value: function tabComplete(line, cb) {
      var list = ['hello', 'world', 'show', 'me'];
      var filtered = _lodash2.default.filter(list, function (item) {
        return item.indexOf(line) > -1;
      });
      return cb(null, [filtered, line]);
    }
  }, {
    key: 'setHistory',
    value: function setHistory(name, cb) {
      this.sessionName = name;
      this.historyPath = this.config.historyPath;
      //console.log('Repl.setHistory', this.config, this.config.historyPath)
      if (!this.history) this.history = new _history2.default(this.replServer, this.historyPath);
      this.history.setFilePath(this.historyPath, cb);
    }
  }, {
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
    key: 'initialize',
    value: function initialize(cb) {
      var _this2 = this;

      this.shell.loadProfileAsync().then(function () {
        return _this2.setHistoryAsync(_this2.config.profile);
      }).then(function () {
        return _this2.history.initializeAsync();
      }).then(function () {
        return cb();
      }).catch(cb);
    }
  }, {
    key: 'shutdown',
    value: function shutdown(cb) {
      this.shell.saveProfileAsync().then(function () {
        return cb();
      }).catch(cb);
    }
  }], [{
    key: 'run',
    value: function run(options) {
      //console.log('isTTY?', process.stdin);
      var shellRepl = new Repl(options);
      shellRepl.initialize(function (err) {
        if (err) {
          console.error('shell.repl.init.ERROR', err.stack);
          process.exit(-1);
        }
      });
    }
  }]);

  return Repl;
}();

_bluebird2.default.promisifyAll(Repl.prototype);

module.exports = Repl;