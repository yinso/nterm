#!/usr/bin/env node
var uuid = require('uuid');
var yargs = require('yargs')
  .alias('p', 'profile')
  .default('profile', 'default');
var repl = require('../lib/repl');
var argv = yargs.argv;
argv.appName = 'nterm';
repl.run(argv);
