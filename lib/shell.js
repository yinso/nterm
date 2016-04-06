'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _which2 = require('which');

var _which3 = _interopRequireDefault(_which2);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fs = require('./fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _events = require('events');

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

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
      env: _this.env,
      stdio: options.stdio || 'inherit'
    });
    if (options.stdio == 'pipe') {
      _this.inner.stdout.pipe(process.stdout);
      _this.inner.stderr.pipe(process.stderr);
      process.stdin.pipe(_this.inner.stdin);
    }
    /*
    this.inner.stdout.on('data', (data) => {
      console.log('stdout.data', data)
      this.emit('stdout', data);
    })
    this.inner.stderr.on('data', (data) => {
      console.error('stderr.data', data)
      this.emit('stderr', data);
    }) //*/
    _this.inner.on('close', function (code) {
      //console.log('process.done', code);
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
  function Shell(config) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Shell);

    this.config = config;
    this.env = options.env || process.env || {};
    this.dirStack = new DirStack(this.env.PWD || process.cwd());
    this.stdin = options.stdin || process.stdin;
    this.stdout = options.stdout || process.stdout;
    this.stderr = options.stderr || process.stderr;
  }

  _createClass(Shell, [{
    key: 'loadProfile',
    value: function loadProfile(cb) {
      var _this2 = this;

      //console.log('Shell.loadProfile', this.config)
      _fs2.default.readFileAsync(this.config.profilePath, 'utf8').then(function (data) {
        var parsed = _jsYaml2.default.safeLoad(data);
        _this2.env = _lodash2.default.extend(_this2.env, parsed.env || {});
        return _this2.chdirAsync(_this2.env.PWD);
      }).then(function () {
        return cb();
      }).catch(function (e) {
        return cb(null, _this2);
      });
    }
  }, {
    key: 'saveProfile',
    value: function saveProfile(cb) {
      try {
        var profile = {
          cwd: this.cwd(),
          env: this.env
        };
        _fs2.default.writeFile(this.config.profilePath, _jsYaml2.default.safeDump(profile), 'utf8', cb);
      } catch (e) {
        return cb(e);
      }
    }
  }, {
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
      var _this3 = this;

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
          _this3.dirStack.push(destPath);
          _this3.env.PWD = destPath;
          return cb();
        }
        return cb(new Error("Shell.cd:not_a_directory: " + destPath));
      });
    }
  }, {
    key: 'exec',
    value: function exec(cmd, args, cb) {
      var _this4 = this;

      if (arguments.length == 2) {
        cb = args;
        args = [];
      }
      this.spawnAsync(cmd, args, {
        close: function close(code) {
          //console.log('process.closed', cmd)
          _this4.readline.resume(); //
          if (code != 0) {
            return cb(new Error("process.close.error: " + code));
          } else {
            return cb();
          }
        }
      }).then(function (proc) {
        return;
      }).catch(cb);
    }
  }, {
    key: 'spawn',
    value: function spawn(cmd, args, options, cb) {
      var _this5 = this;

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
        _this5.readline.pause();
        return cb(null, new Process({
          cmd: cmdFile,
          cwd: _this5.cwd(),
          env: _this5.env,
          args: args,
          stdio: 'inherit',
          stdout: options.stdout,
          stderr: options.stderr,
          close: options.close
        }));
      });
    }
  }, {
    key: 'readline',
    get: function get() {
      return this._rli;
    },
    set: function set(val) {
      this._rli = val;
    }
  }]);

  return Shell;
}();

_bluebird2.default.promisifyAll(Shell.prototype);

module.exports = Shell;