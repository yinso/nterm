'use strict';
const which = require('which');
const glob = require('glob');
const fs = require('fs');
const path = require('path');
let { execFile, spawn }= require('child_process');
let { EventEmitter } = require('events');

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

class Process extends EventEmitter {
  constructor (options) {
    super();
    this.options = options || {};
    this.cmd = this.options.cmd;
    this.args = this.options.args || [];
    this.env = this.options.env || process.env;
    this.cwd = this.options.cwd || process.cwd();
    if (this.options.stdout) {
      this.on('stdout', this.options.stdout);
    }
    if (this.options.stderr) {
      this.on('stderr', this.options.stderr);
    }
    if (this.options.close) {
      this.on('close', this.options.close)
    }
    this.inner = spawn(this.cmd, this.args, {
      cwd: this.cwd,
      env: this.env
    });
    this.inner.stdout.on('data', (data) => {
      console.log('stdout.data', data)
      this.emit('stdout', data);
    })
    this.inner.stderr.on('data', (data) => {
      console.error('stderr.data', data)
      this.emit('stderr', data);
    })
    this.inner.on('close', (code) => {
      console.log('process.done', code);
      this.emit('close', code);
    })
  }
}

class Shell {
  constructor (options) {
    this.options = options || {};
    this.env = this.options.env || process.env;
    this.dirStack = new DirStack(this.options.pwd || process.cwd());
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

  cd (newDir, cb) {
    let cwd = this.dirStack.top();
    if (newDir == cwd)
      return cb();
    let destPath = path.resolve(cwd, newDir);
    fs.stat(destPath, (err, stat) => {
      if (err)
        return cb(err);
      if (stat.isDirectory()) {
        this.dirStack.push(destPath);
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
    which(cmd, (err, cmdFile) => {
      if (err)
        return cb(err)
      execFile(cmdFile, args, {
        cwd: this.dirStack.top(),
        env: this.env
      }, (err, stdout, stderr) => {
        console.log('Shell.exec.results', err, stdout, stderr);
        console.log(stdout)
        console.error(stderr)
        return cb(err);
      })
    })
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
        stdout: options.stdout,
        stderr: options.stderr,
        close: options.close
      }))
    })
  }
}

module.exports = Shell
