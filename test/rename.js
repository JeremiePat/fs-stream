'use strict';

var fsnode    = require('fs');
var fsx       = require('fs-extra');
var path      = require('path');
var through   = require('through2');
var assert    = require('assert');

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

  function fileExist(file) {
    try {
      fsnode.accessSync(file, fsnode.R_OK);
      return true;
    } catch (e) {
      return false;
    }
  }

  function chkNotOveride(files) {
    assert(fileExist(fullPath3), 'The renamed file exist');
    assert.strictEqual(files.length, 2, 'We still have 2 files');
    assert.notStrictEqual(files.indexOf(fullPath3), -1, 'The renamed file has been pushed in the stream');
  }

  function chkOveride(files) {
    assert(fileExist(fullPath3), 'The renamed file exist');
    assert.strictEqual(files.length, 1, 'We only have one file remaining');
    assert.notStrictEqual(files.indexOf(fullPath3), -1, 'The renamed file has been pushed in the stream');
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
