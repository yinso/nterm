import { EventEmitter } from 'events'
import { spawn } from 'child_process'
import kill from 'tree-kill'

export default class Process extends EventEmitter {
  constructor (options) {
    super();
    this.options = options || {};
    this.cmd = this.options.cmd;
    this.args = this.options.args || [];
    this.env = this.options.env || process.env;
    this.cwd = this.options.cwd || process.cwd();
    /*
    if (this.options.stdout) {
      this.on('stdout', this.options.stdout);
    }
    if (this.options.stderr) {
      this.on('stderr', this.options.stderr);
    }//*/
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

  handle(sig) {
    console.log('Process.handle', sig, this.inner)
    kill(this.inner.pid, sig)
  }
}
