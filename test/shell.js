const Shell = require('../src/shell');
let { assert } = require('chai');
const path = require('path');

describe('shell test', () => {
  var shell;
  it('can create shell object', (done) => {
    shell = new Shell();
    done();
  })

  it('can return pwd', (done) => {
    shell.pwd((err, res) => {
      if (err)
        return done(err)
      try {
        assert.equal(res, process.cwd());
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it('can resolve path', (done) => {
    shell.which('node', (err, res) => {
      if (err)
        return done(err);
      else {
        console.log('which node => ', res);
        done();
      }
    })
  })

  it('can change directory', (done) => {
    shell.cd('test', (err) => {
      if (err)
        return done(err);
      try {
        assert.equal(shell.dirStack.top(), __dirname);
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it('can error when cd to invalid directory', (done) => {
    shell.cd('shell.js', (err) => {
      if (err)
        return done()
      return done(new Error("should-have-been-invalid-directory"));
    })
  })

  it('can exec', (done) => {
    shell.exec('node', ['-e', '"console.log(1 + 1)"'], (err) => {
      done(err)
    })
  })

  it('can spawn', (done) => {
    shell.spawn('node', ['-e', '"console.log(1 + 1)"'], {
      stdout: console.log,
      stderr: console.error,
      close (code) {
        console.log('exit code', code);
        if (code != 0) {
          return done(new Error("exit code != 0"))
        }
        done();
      }
    }, (err, proc) => {
      if (err)
        done(err)
    });
  })
})
