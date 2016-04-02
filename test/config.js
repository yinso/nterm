import Config from '../src/config'

describe('config test', () => {
  it('can ensure config', (done) => {
    Config.initialize((err, config) => {
      if (err)
        done(err)
      console.log('config object', config)
      done()
    })
  })
})
