'use strict';

var fs      = require('fs');
var through = require('through2');

function write(d, m) {
  var fn = typeof d === 'function' ? d : function () { return d; };
  var mode = m === 'r+' ? m : 'w';

  return through.obj(function (file, enc, cb) {

    if (!file.stats.isFile()) {
      cb(null, file);
      return;
    }

    fs.writeFile(file.path, fn(file.path), {
      encoding: 'utf8',
      flag: mode
    },
    function (err) {
      cb(err, file);
    });
  });
}

module.exports = write;
