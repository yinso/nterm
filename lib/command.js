'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * command - representing a bash command.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _shellParse = require('shell-parse');

var _shellParse2 = _interopRequireDefault(_shellParse);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Command = function () {
  function Command(shell) {
    _classCallCheck(this, Command);

    this.shell = shell;
  }

  _createClass(Command, [{
    key: 'exec',
    value: function exec(cb) {}
  }], [{
    key: 'parse',
    value: function parse(stmt) {
      return (0, _shellParse2.default)(stmt);
    }
  }, {
    key: 'build',
    value: function build(shell, stmt) {
      var _this = this;

      var parsed = this.parse(stmt);
      if (parsed instanceof Array) {
        var commands = parsed.map(function (cmd) {
          return _this._buildOne(shell, cmd);
        });
        return new CommandGroup(shell, commands);
      } else {
        throw new Error("Command.build:ERROR:NOT_ARRAY:" + stmt);
      }
    }
  }, {
    key: '_buildOne',
    value: function _buildOne(shell, parsed) {
      switch (parsed.type) {
        case 'command':
          return this._command(shell, parsed);
          break;
        default:
          throw new Error("Command.build:unsupported_type: " + parsed.type);
      }
    }
  }, {
    key: '_command',
    value: function _command(shell, parsed) {
      console.log("Command.buildCommand", parsed);
      switch (parsed.command.value) {
        case 'cd':
          return new CdCommand(shell, parsed.args[0].value);
        case 'pwd':
          return new PwdCommand(shell);
        default:
          return new ExecCommand(shell, parsed.command.value, parsed.args.map(function (arg) {
            return arg.value;
          }));
      }
    }
  }]);

  return Command;
}();

_bluebird2.default.promisifyAll(Command.prototype);

var CommandGroup = function (_Command) {
  _inherits(CommandGroup, _Command);

  function CommandGroup(shell, commands) {
    _classCallCheck(this, CommandGroup);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(CommandGroup).call(this, shell));

    if (!(commands instanceof Array)) {
      throw new Error("CommandGroup.ctor:must_be_array");
    }
    commands.forEach(function (command, i) {
      if (!(command instanceof Command)) {
        throw new Error("CommandGroup.ctor.item_must_be_command");
      }
    });
    _this2.commands = commands;
    return _this2;
  }

  _createClass(CommandGroup, [{
    key: 'exec',
    value: function exec(cb) {
      _bluebird2.default.map(this.commands, function (command) {
        return command.execAsync();
      }).then(function (results) {
        return cb(null, results);
      }).catch(cb);
    }
  }]);

  return CommandGroup;
}(Command);

var PwdCommand = function (_Command2) {
  _inherits(PwdCommand, _Command2);

  function PwdCommand() {
    _classCallCheck(this, PwdCommand);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(PwdCommand).apply(this, arguments));
  }

  _createClass(PwdCommand, [{
    key: 'exec',
    value: function exec(cb) {
      console.log(this.shell.cwd());
      return cb();
    }
  }]);

  return PwdCommand;
}(Command);

var CdCommand = function (_Command3) {
  _inherits(CdCommand, _Command3);

  function CdCommand(shell, destDir) {
    _classCallCheck(this, CdCommand);

    var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(CdCommand).call(this, shell));

    _this4.destDir = destDir;
    return _this4;
  }

  _createClass(CdCommand, [{
    key: 'exec',
    value: function exec(cb) {
      this.shell.chdir(this.destDir, cb);
    }
  }]);

  return CdCommand;
}(Command);

var ExecCommand = function (_Command4) {
  _inherits(ExecCommand, _Command4);

  function ExecCommand(shell, program, args, env) {
    _classCallCheck(this, ExecCommand);

    var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(ExecCommand).call(this, shell));

    _this5.program = program;
    _this5.args = args;
    _this5.env = env;
    return _this5;
  }

  _createClass(ExecCommand, [{
    key: 'exec',
    value: function exec(cb) {
      this.shell.exec(this.program, this.args, cb);
    }
  }]);

  return ExecCommand;
}(Command);

module.exports = Command;