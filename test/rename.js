'use strict';

var fsnode  = require('fs');
var fsx     = require('fs-extra');
var path    = require('path');
var through = require('through2');
var assert  = require('../tools/test.assert.js');

var fs = require('../index.js');

describe('rename', function () {
  var root      = path.resolve('.');
  var dir       = path.join('test', 'dir');
  var fileName1 = 'a.txt';
  var fileName2 = 'b.txt';
  var fileName3 = 'c.txt';
  var fullPath1 = path.join(root, dir, 'a.txt');
  var fullPath2 = path.join(root, dir, 'b.txt');
  var fullPath3 = path.join(root, dir, 'c.txt');

  beforeEach(function () {
    fsx.ensureFileSync(fullPath1);
    fsx.ensureFileSync(fullPath2);

    fsnode.writeFileSync(fullPath1, fileName1, 'utf8');
    fsnode.writeFileSync(fullPath2, fileName2, 'utf8');
  });

  afterEach(function () {
    fsx.removeSync(path.join(root, dir));
  });

  function chkNotOveride(files) {
    assert.fileExist(fullPath3, true);
    assert.streamLength(files, 2, true);
    assert.fileInStream(files, fullPath3, true);
  }

  function chkOveride(files) {
    assert.fileExist(fullPath3, true);
    assert.streamLength(files, 1, true);
    assert.fileInStream(files, fullPath3, true);
  }

  var configuration = [
    {param: [fileName3       ], result: chkNotOveride},
    {param: [fileName3, false], result: chkNotOveride},
    {param: [fileName3, true ], result: chkOveride   }
  ];

  function buildFirstParam(paramType) {
    return function (conf) {
      var title = [
        'Rename files with a ',
        paramType === 'fn' ? 'function' : 'string',
        ' (override: ',
        conf.param[1] === undefined ? 'default' : conf.param[1],
        ')'
      ].join('');


      if (paramType === 'fn') {
        var name = conf.param[0];
        conf.param[0] = function () {
          return name;
        };
      }

      it(title, function (done) {
        var files = [];

        function end() {
          conf.result(files);
          done();
        }

        fs(path.join(dir, '*.*'))
          .pipe(fs.rename.apply(fs, conf.param))
          .on('end', end)
          .on('error', done)
          .pipe(through.obj(function (file, enc, cb) {
            files.push(file.path);

            cb(null, file);
          }));
      });
    };
  }

  configuration.forEach(buildFirstParam('string'));
  configuration.forEach(buildFirstParam('fn'));
});
