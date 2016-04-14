'use strict';

var fsx     = require('fs-extra');
var path    = require('path');
var through = require('through2');
var assert = require('../tools/test.assert.js');

var fs = require('../index.js');


describe('create', function () {
  var root = path.resolve('test');
  var dir  = 'dir';

  after(function () {
    fsx.removeSync(path.join(root, dir));
  });

  var configuration = [
    {                             },
    {type: 'file'                 },
    {type: 'directory'            },
    {                   add: true },
    {type: 'file',      add: true },
    {type: 'directory', add: true },
    {                   add: false},
    {type: 'file',      add: false},
    {type: 'directory', add: false}
  ];

  function buildFirstParam(paramType) {
    return function (conf, i) {
      var type     = conf.type || 'file';

      var addType  = 'add' in conf ? conf.add ? 'true' : 'false' : 'default';
      var add      = addType === 'default' ? true : conf.add;

      var filename = paramType + i + '.txt';
      var filepath = path.join(root, dir, filename);
      var filerel  = path.join(dir, filename);

      var title    = [
        'A new ', type, (conf.type ? ' (' : ' (implicite, '),
        paramType, ' path, add: ', addType, ')'
      ].join('');

      var files = [];

      it(title, function (done) {
        var file = filerel;

        if (paramType === 'fn') {
          file = function (f) {
            // Path as a function get a path as param
            assert.isDirOrFile(f, 'directory');
            return filerel;
          };
        }

        function end() {
          assert.fileInStream(files, filepath, add);
          assert.isDirOrFile(filepath, type);
          done();
        }

        fs(root)
          .pipe(fs.create(file, conf))
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
