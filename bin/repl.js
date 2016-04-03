#!/usr/bin/env node
var uuid = require('uuid');
var yargs = require('yargs')
  .alias('s', 'session')
  .default('session', uuid.v4());
var repl = require('../lib/repl');

repl.run(yargs.argv);
