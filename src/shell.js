'use strict';
import which from 'which';
import glob from 'glob';
import fs from './fs';
import path from 'path';
import { execFile, spawn } from 'child_process';
import { EventEmitter } from 'events';
import jsYaml from 'js-yaml';
import _ from 'lodash';
import Promise from 'bluebird';
import Process from './process';

class DirStack {
  constructor (dir) {
    this.stack = [];
    if (arguments.length > 0)
      this.push(dir);
  }

  push (dir) {
    this.stack.push(dir);
  }

  isEmpty () {
    return this.stack.length == 0;
  }

  top () {
    if (this.isEmpty())
      throw new Error("DirStack.top:empty")
    return this.stack[this.stack.length - 1];
  }

  pop () {
    if (this.isEmpty())
      throw new Error("DirStack.top:empty")
    return this.stack.pop();
  }
}

import readline from 'readline'

class BackgroundListener extends EventEmitter {
  constructor (options = {}) {
    super()
    this.rli = readline.createInterface({
      input: options.stdin || process.stdin,
      output: options.stdout || process.stdout,
      terminal: true
    })
    this.rli.on('SIGINT', () => {
      this.emit('SIGINT')
    })
  }
  pause () {
    this.rli.pause()
  }
  resume () {
    this.rli.resume()
  }
  close () {
    this.rli.close()
  }
}

class Shell {
  constructor (config, options = {}) {
    this.config = config;
    this.env = options.env || process.env || {};
    this.dirStack = new DirStack(this.env.PWD || process.cwd());
    this.stdin = options.stdin || process.stdin;
    this.stdout = options.stdout || process.stdout;
    this.stderr = options.stderr || process.stderr;
  }

  get readline () {
    return this._rli;
  }

  set readline (val) {
    this._rli = val
  }

  loadProfile (cb) {
    //console.log('Shell.loadProfile', this.config)
    fs.readFileAsync(this.config.profilePath, 'utf8')
      .then((data) => {
        var parsed = jsYaml.safeLoad(data)
        this.env = _.extend(this.env, parsed.env || {})
        return this.chdirAsync(this.env.PWD)
      })
      .then(() => {
        return cb()
      })
      .catch((e) => {
        return cb(null, this)
      })
  }

  saveProfile (cb) {
    try {
      let profile = {
        cwd: this.cwd(),
        env: this.env
      };
      fs.writeFile(this.config.profilePath, jsYaml.safeDump(profile), 'utf8', cb)
    } catch (e) {
      return cb(e)
    }
  }

  which (cmd, cb) {
    return which(cmd, cb);
  }

  cwd () {
    return this.dirStack.top();
  }

  pwd (cb) {
    return cb(null, this.dirStack.top());
  }

  chdir (newDir, cb) {
    let cwd = this.dirStack.top();
    if (newDir == cwd)
      return cb();
    if (newDir == '-') {
      this.dirStack.pop();
      this.env.PWD = this.dirStack.top();
      return cb();
    }
    let destPath = path.resolve(cwd, newDir);
    fs.stat(destPath, (err, stat) => {
      if (err)
        return cb(err);
      if (stat.isDirectory()) {
        this.dirStack.push(destPath);
        this.env.PWD = destPath;
        return cb();
      }
      return cb(new Error("Shell.cd:not_a_directory: " + destPath));
    })
  }

  exec (cmd, args, cb) {
    if (arguments.length == 2) {
      cb = args;
      args = [];
    }
    this.spawnAsync(cmd, args, {
      close: (code) => {
        delete this.fgJob;
        if (code != 0) {
          return cb(new Error("process.close.error: " + code))
        } else {
          return cb()
        }
      }
    })
      .then((proc) => {
        this.fgJob = proc;
        return
      })
      .catch(cb)
  }

  spawn(cmd, args, options, cb) {
    if (arguments.length == 2) {
      cb = options;
      options = {};
      args = [];
    } else if (arguments.length == 3) {
      cb = options;
      options = {};
    }
    which(cmd, (err, cmdFile) => {
      if (err)
        return cb(err);
      return cb(null, new Process({
        cmd: cmdFile,
        cwd: this.cwd(),
        env: this.env,
        args: args,
        stdio: 'inherit',
        stdin: options.stdin || process.stdin,
        stdout: options.stdout || process.stdout,
        stderr: options.stderr || process.stderr,
        close: options.close
      }))
    })
  }

  handleSIGINT(cb) {
    if (this.fgJob) {
      this.fgJob.handle('SIGINT')
    }
  }

  handleSignal(signal, cb = () => {}) {
    switch (signal) {
      case 'SIGINT':
        this.handleSIGINT(cb)
        break;
      default:
        cb();
    }
  }
}

Promise.promisifyAll(Shell.prototype)

module.exports = Shell
