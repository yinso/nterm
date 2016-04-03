/**
 * command - representing a bash command.
 */
import parse from 'shell-parse';
import Promise from 'bluebird';

class Command {
  constructor (shell) {
    this.shell = shell;
  }

  exec (cb) {

  }

  static parse(stmt) {
    return parse(stmt);
  }

  static build(shell, stmt) {
    var parsed = this.parse(stmt);
    if (parsed instanceof Array) {
      var commands = parsed.map((cmd) => {
        return this._buildOne(shell, cmd)
      });
      return new CommandGroup(shell, commands);
    } else {
      throw new Error("Command.build:ERROR:NOT_ARRAY:" + stmt)
    }
  }

  static _buildOne(shell, parsed) {
    switch (parsed.type) {
      case 'command':
        return this._command(shell, parsed);
        break;
      default:
        throw new Error("Command.build:unsupported_type: " + parsed.type)
    }
  }

  static _command(shell, parsed) {
    console.log("Command.buildCommand", parsed);
    switch (parsed.command.value) {
      case 'cd':
        return new CdCommand(shell, parsed.args[0].value);
      case 'pwd':
        return new PwdCommand(shell);
      default:
        return new ExecCommand(shell, parsed.command.value, parsed.args.map((arg) => { return arg.value }))
    }
  }
}

Promise.promisifyAll(Command.prototype)

class CommandGroup extends Command {
  constructor (shell, commands) {
    super(shell)
    if (!(commands instanceof Array)) {
      throw new Error("CommandGroup.ctor:must_be_array")
    }
    commands.forEach((command, i) => {
      if (!(command instanceof Command)) {
        throw new Error("CommandGroup.ctor.item_must_be_command")
      }
    })
    this.commands = commands;
  }

  exec(cb) {
    Promise.map(this.commands, (command) => {
      return command.execAsync()
    })
      .then((results) => {
        return cb(null, results)
      })
      .catch(cb)
  }
}

class PwdCommand extends Command {
  exec(cb) {
    console.log(this.shell.cwd())
    return cb()
  }
}

class CdCommand extends Command {
  constructor (shell, destDir) {
    super(shell)
    this.destDir = destDir;
  }

  exec(cb) {
    this.shell.chdir(this.destDir, cb)
  }
}

class ExecCommand extends Command {
  constructor (shell, program, args, env) {
    super(shell)
    this.program = program;
    this.args = args;
    this.env = env;
  }

  exec(cb) {
    this.shell.exec(this.program, this.args, cb)
  }
}

module.exports = Command;
