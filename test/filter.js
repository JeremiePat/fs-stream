'use strict';

var fsx       = require('fs-extra');
var path      = require('path');
var minimatch = require('minimatch');
var through   = require('through2');
var assert    = require('../tools/test.assert.js');

var fs = require('../index.js');


describe('filter', function () {
  var root  = path.resolve('.');
  var dir   = path.join('test', 'dir');
  var file1 = path.join(root, dir, 'a.txt');
  var file2 = path.join(root, dir, 'b.txt');
  var file3 = path.join(root, dir, 'a.md');
  var file4 = path.join(root, dir, 'b.md');
  var match = path.join(dir, '*.txt');

  before(function () {
    fsx.ensureFileSync(file1);
    fsx.ensureFileSync(file2);
    fsx.ensureFileSync(file3);
    fsx.ensureFileSync(file4);
  });

  after(function () {
    fsx.removeSync(path.join(root, dir));
  });

  var configuration = [
    [match],
    [match, true],
    [match, false],
  ];

  function buildFirstParam(paramType) {
    return function (conf) {
      var pattern  = conf[0];
      var keep     = conf[1];
      var keepType = keep === undefined ? 'Default' : String(keep);

      if (paramType === 'fn') {
        pattern = function (file) {
          assert.fileExist(file, true);
          return minimatch(file, path.resolve(root, conf[0]));
        };
      }

      var title = [
        keepType === 'Default' ? 'keep (Default)' :
        keepType === 'true'    ? 'keep' : 'remove',
        '2 files from the stream with pattern:', paramType
      ].join(' ');

      var files = [];

      it(title, function (done) {
        function end() {
          assert.streamLength(files, 2, true);

          files.forEach(function (f) {
            if (keepType === 'false') {
              assert.pathMatch(f, /\.md$/);
            } else {
              assert.pathMatch(f, /\.txt$/);
            }
          });

          done();
        }

        fs(path.join(root, dir, '*.*'))
          .pipe(fs.filter(pattern, keep))
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
