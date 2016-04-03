import repl from 'repl';
import Shell from './shell';
import Config from './config';
import parse from 'shell-parse';
import util from 'util';
import History from './history';
import os from 'os';
import path from 'path';
import Command from './command';

class Repl {
  constructor (options) {
    this.shell = new Shell(options)
    let customEval = (cmd, context, filename, cb) => {
      this.eval(cmd, context, filename, cb)
    }
    this.replServer = repl.start({
      prompt: '$> ',
      terminal: true,
      useColors: true,
      eval: customEval
    })
    this.historyPath = path.join(os.homedir(), '.nterm', 'test.history.log')
    this.history = new History(this.replServer, this.historyPath)
  }

  eval (cmd, context, filename, cb) {
    try {
      let command = Command.build(this.shell, cmd)
      return command.exec((err, res) => {
        if (err)
          cb(err)
        else {
          cb()
        }
      })
    } catch (e) {
      return cb(e)
    }
  }

  init (cb) {
    this.history.load(cb)
  }
}

function run(options) {
  Config.initialize((err, config) => {
    if (err) {
      console.error(err);
      process.exit(-1)
    }
    let shellRepl = new Repl(options)
    shellRepl.init((err) => {
      if (err) {
        console.error('shell.repl.init.ERROR', err)
        process.exit(-1)
      }
    })
  })
}

module.exports = {
  run: run
}
