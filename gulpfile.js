'use strict';
const gulp = require('gulp');
const babel = require('gulp-babel');
const shell = require('gulp-shell')

gulp
  .task('js', shell.task([
    './node_modules/.bin/babel src -d lib',
    './node_modules/.bin/browserify ./lib/client.js -o public/js/main.js'
  ]))
  .task('css', shell.task([
    './node_modules/.bin/stylus -u ./node_modules/nib -u ./node_modules/bootstrap-styl ./stylus/main.styl -o public/css/'
  ]))
  .task('build', [
    'js'
  ])
  .task('start', ['build'], shell.task([
    'nterm'
  ]))
