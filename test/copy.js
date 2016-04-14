'use strict';

var fsnode  = require('fs');
var fsx     = require('fs-extra');
var path    = require('path');
var through = require('through2');
var assert  = require('../tools/test.assert.js');

var fs = require('../index.js');


describe('copy', function () {
  var origin = path.join('test', 'origin');
  var dest   = path.join('test', 'dest');
  var file1  = 'one.txt';
  var file2  = 'two.txt';
  var f1o    = path.resolve(path.join(origin, file1));
  var f1d    = path.resolve(path.join(dest,   file1));
  var f2o    = path.resolve(path.join(origin, file2));
  var f2d    = path.resolve(path.join(dest,   file2));

  before(function () {
    fsx.ensureDirSync(path.resolve(origin));
    fsx.ensureDirSync(path.resolve(dest));
  });

  after(function () {
    fsx.removeSync(path.resolve(origin));
    fsx.removeSync(path.resolve(dest));
  });

  beforeEach(function () {
    fsx.ensureFileSync(f1o);
    fsx.ensureFileSync(f2o);
    fsx.ensureFileSync(f2d);
    fsnode.writeFileSync(f2o, origin, 'utf8');
    fsnode.writeFileSync(f2d, dest,   'utf8');
  });

  afterEach(function () {
    fsx.removeSync(f1d);
  });

  var configuration = [
    {                           },
    {override: false, add: true },
    {override: true,  add: false},
    {override: false, add: false},
    {override: true,  add: true }
  ];

  function buildFirstParam(paramType) {
    return function (conf) {
      var addType  = 'add' in conf ? conf.add ? 'true' : 'false' : 'default';
      var add      = addType === 'default' ? false : conf.add;

      var ovrType  = 'override' in conf ? conf.override ? 'true' : 'false' : 'default';
      var ovr      = ovrType === 'default' ? false : conf.override;

      var files = [];

      var title    = [
        (ovr ? '2 files ' : '1 file '), 'has been copied',
        ' (', paramType, ' path, override: ', ovrType, ', add: ', addType, ')'
      ].join('');

      it (title, function (done) {
        var dir = dest;

        if (paramType === 'fn') {
          dir = function (f) {
            // Path as a function get a valide file path as param;
            assert.fileExist(f, true);
            return dest;
          };
        }

        function end() {
          assert.fileInStream(files, f1d, add);
          assert.fileInStream(files, f2d, add);
          assert.fileHasContent(f2d, ovr ? origin : dest, true);
          done();
        }

        fs(path.join(origin, '*.*'))
          .pipe(fs.copy(dir, conf))
          .on('end', end)
          .on('error', done)
          .pipe(through.obj(function (file, e, cb) {
            files.push(file.path);

            cb(null, file);
          }));
      });
    };
  }

  configuration.forEach(buildFirstParam('string'));
  configuration.forEach(buildFirstParam('fn'));
});
