'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _which2 = require('which');

var _which3 = _interopRequireDefault(_which2);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DirStack = function () {
  function DirStack(dir) {
    _classCallCheck(this, DirStack);

    this.stack = [];
    if (arguments.length > 0) this.push(dir);
  }

  _createClass(DirStack, [{
    key: 'push',
    value: function push(dir) {
      this.stack.push(dir);
    }
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      return this.stack.length == 0;
    }
  }, {
    key: 'top',
    value: function top() {
      if (this.isEmpty()) throw new Error("DirStack.top:empty");
      return this.stack[this.stack.length - 1];
    }
  }, {
    key: 'pop',
    value: function pop() {
      if (this.isEmpty()) throw new Error("DirStack.top:empty");
      return this.stack.pop();
    }
  }]);

  return DirStack;
}();

var Process = function (_EventEmitter) {
  _inherits(Process, _EventEmitter);

  function Process(options) {
    _classCallCheck(this, Process);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Process).call(this));

    _this.options = options || {};
    _this.cmd = _this.options.cmd;
    _this.args = _this.options.args || [];
    _this.env = _this.options.env || process.env;
    _this.cwd = _this.options.cwd || process.cwd();
    if (_this.options.stdout) {
      _this.on('stdout', _this.options.stdout);
    }
    if (_this.options.stderr) {
      _this.on('stderr', _this.options.stderr);
    }
    if (_this.options.close) {
      _this.on('close', _this.options.close);
    }
    _this.inner = (0, _child_process.spawn)(_this.cmd, _this.args, {
      cwd: _this.cwd,
      env: _this.env
    });
    _this.inner.stdout.on('data', function (data) {
      console.log('stdout.data', data);
      _this.emit('stdout', data);
    });
    _this.inner.stderr.on('data', function (data) {
      console.error('stderr.data', data);
      _this.emit('stderr', data);
    });
    _this.inner.on('close', function (code) {
      console.log('process.done', code);
      _this.emit('close', code);
    });
    return _this;
  }

  _createClass(Process, [{
    key: 'input',
    value: function input(data) {
      return this.inner.stdin.write(data);
    }
  }]);

  return Process;
}(_events.EventEmitter);

var Shell = function () {
  function Shell(options) {
    _classCallCheck(this, Shell);

    this.options = options || {};
    this.env = this.options.env || process.env;
    this.dirStack = new DirStack(this.options.pwd || process.cwd());
  }

  _createClass(Shell, [{
    key: 'which',
    value: function which(cmd, cb) {
      return (0, _which3.default)(cmd, cb);
    }
  }, {
    key: 'cwd',
    value: function cwd() {
      return this.dirStack.top();
    }
  }, {
    key: 'pwd',
    value: function pwd(cb) {
      return cb(null, this.dirStack.top());
    }
  }, {
    key: 'chdir',
    value: function chdir(newDir, cb) {
      var _this2 = this;

      var cwd = this.dirStack.top();
      if (newDir == cwd) return cb();
      if (newDir == '-') {
        this.dirStack.pop();
        this.env.PWD = this.dirStack.top();
        return cb();
      }
      var destPath = _path2.default.resolve(cwd, newDir);
      _fs2.default.stat(destPath, function (err, stat) {
        if (err) return cb(err);
        if (stat.isDirectory()) {
          _this2.dirStack.push(destPath);
          _this2.env.PWD = destPath;
          return cb();
        }
        return cb(new Error("Shell.cd:not_a_directory: " + destPath));
      });
    }
  }, {
    key: 'exec',
    value: function exec(cmd, args, cb) {
      var _this3 = this;

      if (arguments.length == 2) {
        cb = args;
        args = [];
      }
      (0, _which3.default)(cmd, function (err, cmdFile) {
        if (err) return cb(err);
        (0, _child_process.execFile)(cmdFile, args, {
          cwd: _this3.dirStack.top(),
          env: _this3.env
        }, function (err, stdout, stderr) {
          console.log(stdout);
          console.error(stderr);
          return cb(err);
        });
      });
    }
  }, {
    key: 'spawn',
    value: function spawn(cmd, args, options, cb) {
      var _this4 = this;

      if (arguments.length == 2) {
        cb = options;
        options = {};
        args = [];
      } else if (arguments.length == 3) {
        cb = options;
        options = {};
      }
      (0, _which3.default)(cmd, function (err, cmdFile) {
        if (err) return cb(err);
        return cb(null, new Process({
          cmd: cmdFile,
          cwd: _this4.cwd(),
          env: _this4.env,
          args: args,
          stdout: options.stdout,
          stderr: options.stderr,
          close: options.close
        }));
      });
    }
  }]);

  return Shell;
}();

module.exports = Shell;