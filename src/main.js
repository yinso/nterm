'use strict';
import express from 'express';
import setup from './setup';
import opener from 'opener';
import Config from './config';

function run(options) {
  Config.initialize((err, config) => {
    if (err) {
      console.error(err);
      process.exit(-1);
    }
    var app = express();
    setup.init(app, optionsoptions);
    app.listen(options.port);
    opener('http://localhost:' + options.port);
  })
}

module.exports = {
  run: run
};
