'use strict';

var fs = require('fs');
var through = require('through2');

function watch(fn) {
  return through.obj(function (file, enc, cb) {
    fs.watch(file.path, function (event) {
      if (event === 'change') {
        fn.call(this, file.path);
      }
    });

    cb(null, file);
  });
}

module.exports = watch;
