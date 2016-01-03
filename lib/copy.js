'use strict';

var fs      = require('fs');
var fsx     = require('fs-extra');
var path    = require('path');
var through = require('through2');

function copy(d, options) {
  var fn  = typeof d === 'function' ? d : function () { return d; };
  var opt = options || {};
  opt.override = !!opt.override;
  opt.add      = !!opt.add;

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

        stream.push(file);

        if (opt.add) {
          fs.stat(newPath, function (err, stats) {
            cb(err, {
              cwd   : file.cwd,
              path  : newPath,
              stats : stats
            });
          });
        } else {
          cb();
        }
      });
    });
  });
}

module.exports = copy;