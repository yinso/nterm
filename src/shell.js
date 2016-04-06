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
      env: this.env,
      stdio: options.stdio || 'inherit'
    });
    if (options.stdio == 'pipe') {
      this.inner.stdout.pipe(process.stdout)
      this.inner.stderr.pipe(process.stderr)
      process.stdin.pipe(this.inner.stdin)
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
    this.inner.on('close', (code) => {
      //console.log('process.done', code);
      this.emit('close', code);
    })
  }

  input (data) {
    return this.inner.stdin.write(data)
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
        //console.log('process.closed', cmd)
        this.readline.resume() //
        if (code != 0) {
          return cb(new Error("process.close.error: " + code))
        } else {
          return cb()
        }
      }
    })
      .then((proc) => {
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
      this.readline.pause()
      return cb(null, new Process({
        cmd: cmdFile,
        cwd: this.cwd(),
        env: this.env,
        args: args,
        stdio: 'inherit',
        stdout: options.stdout,
        stderr: options.stderr,
        close: options.close
      }))
    })
  }
}

Promise.promisifyAll(Shell.prototype)

module.exports = Shell
