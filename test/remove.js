'use strict';

var fsx       = require('fs-extra');
var path      = require('path');
var minimatch = require('minimatch');
var through   = require('through2');
var assert    = require('../tools/test.assert.js');

var fs = require('../index.js');


describe('remove', function () {
  var root   = path.resolve('.');
  var dir    = path.join('test', 'dir');
  var subdir = path.join(dir, 'sub');
  var file1  = path.join(dir, 'a.txt');
  var file2  = path.join(subdir, 'b.txt');
  var file3  = path.join(subdir, 'c.md');

  beforeEach(function () {
    fsx.ensureFileSync(path.join(root, file1));
    fsx.ensureFileSync(path.join(root, file2));
    fsx.ensureFileSync(path.join(root, file3));
  });

  after(function () {
    fsx.removeSync(path.join(root, dir));
  });

  var configuration = [{
    pattern: path.join(dir, '**', '*'),
    title  : 'Remove everything recursivly',
    expect : 0
  },{
    pattern: path.join(dir, '**', '*.txt'),
    title  : 'Remove txt files in all directories',
    expect : 2,
  },{
    pattern: path.join(dir, '*.txt'),
    title  : 'Remove text files only in the top directory',
    expect : 3
  }];

  function buildFirstParam(paramType) {
    return function (conf) {
      var title   = conf.title + ' (' + paramType + ')';
      var files   = [];
      var pattern = conf.pattern;

      if (paramType === 'fn') {
        pattern = function (file) {
          assert.pathMatch(file, new RegExp(path.join('^', root, dir)));
          return minimatch(file, path.resolve(root, conf.pattern));
        };
      }

      it(title, function (done) {
        function end() {
          assert.streamLength(files, conf.expect, true);

          var count = [];
          fsx.walk(path.join(root, dir)).on('data', function (f) {
            count.push(f.path);
          }).on('end', function () {
            // conf.expect + 1 because fsx.walk add the initial
            // directory but we don't want to count it.
            assert.streamLength(count, conf.expect + 1, true);
            done();
          });
        }

        fs(path.join(dir, '**', '*'))
          .pipe(fs.remove(pattern))
          .on('end', end)
          .on('error', done)
          .pipe(through.obj(function (file, end, cb) {
            files.push(file.path);

            cb(null, file);
          }));
      });
    };
  }

  configuration.forEach(buildFirstParam('string'));
  configuration.forEach(buildFirstParam('fn'));
});
