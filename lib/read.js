'use strict';

var fs      = require('fs');
var through = require('through2');

function read(fn, options) {
  if (!options && options !== null) {
    options = 'utf8';
  }

  return through.obj(function (file, e, cb) {
    if (options === null || typeof options === 'string') {
      if (file.stats.isDirectory()) {
        fs.readdir(file.path, function (err, files) {
          if (err) { cb(err); return; }

          fn(files);
          cb(null, file);
        });
      }

      else {
        fs.readFile(file.path, options, function (err, data) {
          if (err) { cb(err); return; }

          fn(data);
          cb(null, file);
        });
      }
    }

    else {
      fn(fs.createReadStream(file.path, options));
      cb(null, file);
    }
  });
}

module.exports = read;
