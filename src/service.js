import repl from 'repl';
import Shell from './shell';
import Config from './config';
import parse from 'shell-parse';
import util from 'util';
import History from './history';
import Command from './command';
import Promise from 'bluebird';
import _ from 'lodash';
import Process from './process'

/**
 * Represents the REPL of the shell
 * @param {Object} options
 * @param {string} options.appName - The name of the program. Used for determining the location of the config as well (nterm -> ~/.nterm)
 * @param {string} options.session - the name of the session, defaults to "default"
 */
class Repl {
  constructor (options) {
    this.config = new Config(options)
    this.shell = new Shell(this.config, {}) // shell will store itself
    let customEval = (cmd, context, filename, cb) => {
      this.eval(cmd, context, filename, cb)
    }
    this.replServer = repl.start({
      prompt: '$> ',
      terminal: true,
      useColors: true,
      eval: customEval
    })
    this.shell.readline = this.replServer.rli;
    this.replServer._complete = this.replServer.complete;
    this.replServer.complete = (line, cb) => {
      this.tabComplete(line, cb)
    }
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
    this.replServer.defineCommand('exit', {
      help: 'Exit',
      action: () => {
        console.log('exit...')
        this.shutdown((e) => {
          if (e) {
            console.error(e.stack)
            process.exit(-1)
          } else {
            process.exit(0)
          }
        })
      }
    })
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
    this.replServer.on('SIGINT', () => {
      console.log('SIGINT called')
      this.shell.handleSignal('SIGINT')
    })
  }

  tabComplete (line, cb) {
    var list = ['hello', 'world', 'show', 'me'];
    var filtered = _.filter(list, (item) => { return item.indexOf(line) > -1 });
    return cb(null, [filtered, line])
  }

  setHistory (name, cb) {
    this.sessionName = name;
    this.historyPath = this.config.historyPath;
    //console.log('Repl.setHistory', this.config, this.config.historyPath)
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
    this.shell.loadProfileAsync()
      .then(() => {
        return this.setHistoryAsync(this.config.profile)
      })
      .then(() => {
        return this.history.initializeAsync();
      })
      .then(() => {
        return cb()
      })
      .catch(cb)
  }

  shutdown (cb) {
    this.shell.saveProfileAsync()
      .then(() => {
        return cb()
      })
      .catch(cb)
  }

  static run (options) {
    //console.log('isTTY?', process.stdin);
    let shellRepl = new Repl(options)
    shellRepl.initialize((err) => {
      if (err) {
        console.error('shell.repl.init.ERROR', err.stack)
        process.exit(-1)
      }
    })
  }
}



Promise.promisifyAll(Repl.prototype)

module.exports = Repl
