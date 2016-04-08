import { EventEmitter } from 'events'
import pty from 'pty.js'

export default class Process2 extends EventEmitter {
  constructor (options) {
    super()
    this.inner = pty.spawn(this.cmd, this.args, {
      cols: options.stdin.cols || 80,
      rows: options.stdin.rows || 22,
      cwd: this.cwd,
      env: this.env
    })

    this.inner.on('data', (data) => {
      this.emit('data', data)
    })

    this.inner.on('close', () => {
      this.emit('close')
    })

    this.inner.on('exit', (code, signal) => {
      this.emit('exit', code, signal)
    })

    if (options.stdin) {
      options.stdin.on('data', (data) => {
        this.write(data)
      })
    }

    if (options.stdout) {
      this.on('data', (data) => {
        options.stdout.write(data)
      })
    }

    if (options.close) {
      this.on('close', () => {
        options.close()
      })
    }
  }

  write(data) {
    this.inner.write(data)
  }
}
