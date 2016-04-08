'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _child_process = require('child_process');

var _treeKill = require('tree-kill');

var _treeKill2 = _interopRequireDefault(_treeKill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
    /*
    if (this.options.stdout) {
      this.on('stdout', this.options.stdout);
    }
    if (this.options.stderr) {
      this.on('stderr', this.options.stderr);
    }//*/
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
  }, {
    key: 'handle',
    value: function handle(sig) {
      console.log('Process.handle', sig, this.inner);
      (0, _treeKill2.default)(this.inner.pid, sig);
    }
  }]);

  return Process;
}(_events.EventEmitter);

exports.default = Process;