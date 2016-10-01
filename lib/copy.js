'use strict';

var fs      = require('fs');
var fsx     = require('fs-extra');
var path    = require('path');
var through = require('through2');

function copy(d, options) {
  var fn  = typeof d === 'function' ? d : function () { return d; };
  var opt = options || {};
  opt.override = !!opt.override;

  return through.obj(function (file, enc, cb) {
    var stream = this;
    var name   = path.parse(file.path).base;
    var dir    = path.resolve(file.cwd, String(fn(file.path)));

    if (!dir || dir === file.path) {
      cb(null, file);
      return;
    }

    fs.stat(dir, function (err, stats) {
      // If the target isn't a directory, we take the parent directory;
      if (!err && !stats.isDirectory()) {
        dir = path.resolve(path.parse(dir).dir);
      }

      var newPath = path.join(dir, name);

      fsx.copy(file.path, newPath, {clobber: opt.override}, function (err) {
        if (err) { cb(err); return; }

        if (!opt.add) {
          cb(null, file);
          return;
        }

        fs.stat(newPath, function (err, stats) {
          if (err) { cb(err); return; }

          // We push the original file first unless it has to be replaced
          if (opt.add !== 'replace') {
            stream.push(file);
          }

          cb(null, {
            cwd   : file.cwd,
            path  : newPath,
            stats : stats
          });
        });
      });
    });
  });
}

module.exports = copy;
