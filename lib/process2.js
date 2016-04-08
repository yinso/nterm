'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _pty = require('pty.js');

var _pty2 = _interopRequireDefault(_pty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Process2 = function (_EventEmitter) {
  _inherits(Process2, _EventEmitter);

  function Process2(options) {
    _classCallCheck(this, Process2);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Process2).call(this));

    _this.inner = _pty2.default.spawn(_this.cmd, _this.args, {
      cols: options.stdin.cols || 80,
      rows: options.stdin.rows || 22,
      cwd: _this.cwd,
      env: _this.env
    });

    _this.inner.on('data', function (data) {
      _this.emit('data', data);
    });

    _this.inner.on('close', function () {
      _this.emit('close');
    });

    _this.inner.on('exit', function (code, signal) {
      _this.emit('exit', code, signal);
    });

    if (options.stdin) {
      options.stdin.on('data', function (data) {
        _this.write(data);
      });
    }

    if (options.stdout) {
      _this.on('data', function (data) {
        options.stdout.write(data);
      });
    }

    if (options.close) {
      _this.on('close', function () {
        options.close();
      });
    }
    return _this;
  }

  _createClass(Process2, [{
    key: 'write',
    value: function write(data) {
      this.inner.write(data);
    }
  }]);

  return Process2;
}(_events.EventEmitter);

exports.default = Process2;