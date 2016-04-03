import repl from 'repl';
import Shell from './shell';
import Config from './config';
import parse from 'shell-parse';
import util from 'util';
import History from './history';
import os from 'os';
import path from 'path';
import Command from './command';
import uuid from 'uuid';
import Promise from 'bluebird';

class Repl {
  constructor (options) {
    console.log('Repl.ctor', options)
    this.options = options
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
    this.replServer.defineCommand('hello', {
      help: 'Say Hello',
      action: (name) => {
        setImmediate(() => {
          this.replServer.outputStream.write("Hello, " + name + "\n");
          this.replServer.displayPrompt()
        })
      }
    })
    this.replServer.defineCommand('session', {
      help: 'Set session to a particular point',
      action: (name) => {
        this.setHistory(name, (err) => {
          if (err) {
            this.replServer.outputStream.write("ERROR: " + err.stack)
            this.replServer.displayPrompt()
          } else {
            this.replServer.outputStream.write("session = " + name + "\n")
            this.replServer.displayPrompt()
          }
        })
      }
    })
  }

  setHistory (name, cb) {
    this.sessionName = name;
    this.historyPath = path.join(os.homedir(), '.nterm', 'history', this.sessionName + '.log')
    if (!this.history)
      this.history = new History(this.replServer, this.historyPath)
    this.history.setFilePath(this.historyPath, cb)
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

  initialize (cb) {
    this.setHistoryAsync(this.options.session)
      .then(() => {
        return this.history.initializeAsync();
      })
      .then(() => {
        return cb()
      })
      .catch(cb)
  }
}

function run(options) {
  Config.initialize((err, config) => {
    if (err) {
      console.error(err);
      process.exit(-1)
    }
    let shellRepl = new Repl(options)
    shellRepl.initialize((err) => {
      if (err) {
        console.error('shell.repl.init.ERROR', err)
        process.exit(-1)
      }
    })
  })
}

Promise.promisifyAll(Repl.prototype)

module.exports = {
  run: run
}
