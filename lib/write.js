'use strict';

var fs      = require('fs');
var through = require('through2');

function write(d, m) {
  var fn = typeof d === 'function' ? d : function () { return d; };
  var mode = m === 'a' ? m : 'w';

  if (typeof d === 'function' && typeof m !== 'string') {
    mode = typeof m === 'object' ? m : {};
  }

  return through.obj(function (file, enc, cb) {

    if (!file.stats.isFile()) {
      cb(null, file);
      return;
    }

    if (typeof mode === 'object') {
      fn(fs.createWriteStream(file.path, mode))
      cb(null, file);
    }

    else {
      fs.writeFile(file.path, fn(file.path), {
        encoding: 'utf8',
        flag: mode
      },
      function (err) {
        cb(err, file);
      });
    }
  });
}

module.exports = write;
