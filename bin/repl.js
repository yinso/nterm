#!/usr/bin/env node
var uuid = require('uuid');
var yargs = require('yargs')
  .alias('p', 'profile')
  .default('profile', 'default');
var repl = require('../lib/service');
var argv = yargs.argv;
argv.appName = 'nterm';
console.log('repl.obj', repl)
repl.run(argv);
