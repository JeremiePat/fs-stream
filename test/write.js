'use strict';

var fsnode  = require('fs');
var fsx     = require('fs-extra');
var path    = require('path');
var through = require('through2');
var assert  = require('../tools/test.assert.js');

var fs = require('../index.js');

describe('write', function () {
  var root      = path.resolve('.');
  var dir       = path.join('test', 'dir');
  var fullPath1 = path.join(root, dir, 'a.txt');
  var str       = 'Kikoo!';

  beforeEach(function () {
    fsx.ensureFileSync(fullPath1);

    fsnode.writeFileSync(fullPath1, fullPath1, 'utf8');
  });

  afterEach(function () {
    fsx.removeSync(path.join(root, dir));
  });

  function chkAppend(filepath) {
    assert.fileHasContent(filepath, filepath + str, true);
  }

  function chkOverride(filepath) {
    assert.fileHasContent(filepath, str, true);
  }

  var configuration = [
    {param: [str     ], result: chkOverride},
    {param: [str, 'w'], result: chkOverride},
    {param: [str, 'a'], result: chkAppend  }
  ];

  function buildFirstParam(paramType) {
    return function (conf) {
      var title = [
        'Write in files with a ',
        paramType === 'fn' ? 'function' : 'string',
        ' (write mode: ',
        conf.param[1] === undefined ? 'default' : conf.param[1],
        ')'
      ].join('');

      it(title, function (done) {
        fs(path.join(dir, '*.*'))
          .pipe(fs.write.apply(fs, conf.param))
          .on('end', done)
          .on('error', done)
          .pipe(through.obj(function (file, enc, cb) {
            conf.result(file.path);

            cb(null, file);
          }));
      });
    };
  }

  configuration.forEach(buildFirstParam('string'));
  configuration.forEach(buildFirstParam('fn'));
});
