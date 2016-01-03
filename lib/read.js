'use strict';

var fs      = require('fs');
var path    = require('path');
var through = require('through2');

function read(fn) {
  var options = arguments.lenght > 1 ? arguments[1] : 'utf8';

  return through.obj(function (file, e, cb) {
    var filepath = path.join(file.dir, file.name);

    if (options === null || typeof options === 'string') {
      if (file.stats.isDirectory()) {
        fs.readdir(filepath, function (err, files) {
          if (err) { cb(err); return; }

          fn(files);
          cb(null, file);
        });
      }

      else {
        fs.readFile(filepath, options, function (err, data) {
          if (err) { cb(err); return; }

          fn(data);
          cb(null, file);
        });
      }
    }

    else {
      fn(fs.createReadStream(filepath, options));
      cb(null, file);
    }
  });
}

module.exports = read;
