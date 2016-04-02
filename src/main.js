'use strict';
var express = require('express');
var setup = require('./setup');
var opener = require('opener');

function run(config) {
  var app = express();
  setup.init(app, config);
  app.listen(config.port);
  opener('http://localhost:' + config.port);
}

function foo() {
  
}
module.exports = {
  run: run
};
