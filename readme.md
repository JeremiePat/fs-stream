fs-stream
===============================================================================

A wrapper and a set of utilities around [glob-stream](https://www.npmjs.com/package/glob-stream) to handle simple files manipulation through streams.

Usage
-------------------------------------------------------------------------------
```js
var fs = require('fs-stream');

fs('**/*.*')
  .pipe(fs.rename(function (path) {
    return path.replace('/\.txt$/', '.md');
  }))
  .pipe(fs.move('target/dir'))
  .pipe(fs.copy('another/target/dir'))
  .pipe(fs.remove('*.js'))
  .pipe(fs.filter(function (path) {
    return (/\.md$/i).test(path);
  }))
  .pipe(fs.read(function (readStream) {
    readStream.pipe(process.stdout);
  }), {})
  .pipe(fs.watch(function (path) {
    console.log(path, 'has changed.');
  }))
  .pipe(fs.write('\nHi!', 'r+'))
```

API
-------------------------------------------------------------------------------

### _module_(globPattern, [options])

Return a stream of files and directories. For a full documentation of `options` and glob patterns, take a look at the [glob-stream documentation](https://github.com/gulpjs/glob-stream).

### copy(dir, [options])

Copy all the files in the stream. `dir` can be:

* `String`: The path to the directory where to copy all the files
* `Function`: This function get the actual path to the file and must return the path to the directory where the file must be copied.

> **NOTE:** _relative path are resolved against the same base `cwd` as the one used to set up the stream._

The optional `options` parameter is an object with the following optional keys:
* `override`: A boolean indicating if the copy must override an existing file with the same name (default: **false**)
* `add`: A boolean indicating if the copied file must be added to the stream. (default: **false**)

```js
var fs = require('fs-stream');

fs('/files/*.md')
  .pipe(fs.copy('/files/markdown'), {add: true});
```

### create(path, [options])

Create a file or directory within each directory in the stream. `path` can be

* `String`: The relative path to the file to be created.
* `Function`: This function get the actual path to the directory and must return the relative path to the file to be created.

> **NOTE:** _The relative path of each file is resolved from the related directory from the stream._

The optional `options` parameter is an object with the following optionnal keys:
* `type`: Either `file` or `directory` (default: **file**)
* `add`: A boolean indicating if the copied file must be added to the stream. (default: **true**)

```js
var fs = require('fs-stream');

fs('/files')
  .pipe(fs.create('markdown', { type: 'directory' }))
  .pipe(fs.create(function (dir) {
    if ((/\/markdown$/).test(dir)) {
      return 'foo.md';
    }
  }));
```

### filter(pattern, keep)

Filter the files in the stream. `pattern` can be:

* `String`: A glob pattern that files must match.
* `Function`: This function get the actual path to the file and must return a boolean.

> **NOTE:** _relative patterns are resolved against the same base `cwd` as the one used to set up the stream._

The optional `keep` parameter indicate if files matching the pattern must be kept in the stream and the others to be excluded (`true`), or the other way around (`false`)  (default: **true**)

```js
var fs = require('fs-stream');

fs('/files/*.*')
  .pipe(fs.filter('/files/*.md'));
```

### move(dir, [override])

Move all the files in the stream. `dir` can be:

* `String`: The path to the directory where to move all the files
* `Function`: This function get the actual path to the file and must return the path to the directory where the file must be moved.

> **NOTE:** _relative path are resolved against the same base `cwd` as the one used to set up the stream._

The optional `override` parameter indicate if a file with the same name in the target directory must be overridden (default: **true**)

If the provided path is something else than a directory, the parent directory will be used. If the directory provided does not exist, it is created automatically.

```js
var fs = require('fs-stream');

fs('/files/*.md')
  .pipe(fs.move('/files/markdown'));
```

### read(callback, [options])

Help reading each file in the stream.

`callback` is a function that will get the file content. The nature of the content depend on the `options` parameter:

* If `options` is `null`, `callback` will get a buffer object.
* If `options` is a string representing an encoding, `callback` will get a string.
* If `options` is [a stream configuration object](https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options), `callback` will get a readable stream.

The default value for `options` is `utf8`.

> **NOTE:** _If the file is actually a directory, the callback function will get an array of all the files in the directory instead of a buffer or a string. See [fs.readdir](https://nodejs.org/api/fs.html#fs_fs_readdir_path_callback) for details._

```js
var fs = require('fs-stream');

fs('/files/*.*')
  .pipe(fs.read(function (fileContent) {
    console.log(fileContent);
  }));
```

### remove(pattern)

Delete all files that match the pattern. `pattern` can be:

* `String`: A glob pattern that files must match to be deleted.
* `Function`: This function get the actual path to the file and must return `true` (remove the file) or `false` (keep the file).

> **NOTE:** _relative patterns are resolved against the same base `cwd` as the one used to set up the stream._

```js
var fs = require('fs-stream');

fs('/files/*.*')
  .pipe(fs.remove('/files/*.md'));
```

### rename(name, [override])

Change the name of all the files in the stream. `name` can be:

* `String`: Rename the first file in the stream or override all of them up to the last.
* `Function`: This function get the actual path to the file and must return a
string which is the new name of the file.

The optional `override` parameter indicate if a file with the same name must be overridden (default: **false**). Careful as this can take long on large file system. It's more efficient to remove the unnecessary files as they transit through the stream then renaming the last one. It's also worth noting that the order of the files in the stream is not guaranteed.

```js
var path = require('path');
var fs   = require('fs-stream');

fs('**/*.md')
  .pipe(fs.rename(function (file) {
    var name = path.parse(file.path).base;
    return name.replace(/\.md$/, '.txt');
  }));
```

### watch(listener)

Watch for changes on each files of the stream.

When a change occurs, the `listener` function is called and get the full path of the changed file.

> **NOTE:** _Watching files is subject to the restrictions documented with the [fs.watch](https://nodejs.org/dist/latest-v4.x/docs/api/fs.html#fs_fs_watch_filename_options_listener) function._

```js
var fs = require('fs-stream');

fs('**/*.md')
  .pipe(fs.watch(function (file) {
    var name = path.parse(file.path).base;
    console.log(name, 'as changed!');
  }));
```

### write(data, [mode])

Perform a simple writing action on all files from the stream. `data` can be:

* `String`: The content to push inside each files
* `Function`: This function get the actual path to the file and must return a
string which is the content to push into the file.

`mode` define how the new content must be pushed into the files:

* If its value is `w` then the content of the files will be replaced.
* If its value is `r+` then the content will be append at the end of each file.

The default value for `mode` is `w`;

> **NOTE:** _For more advance writing action (like writing binary data), it is recommended to use ad hoc [writing streams](https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options)._

```js
var fs = require('fs-stream');

fs('**/*.log')
  .pipe(fs.write(function (file) {
    return '\nLast update: ' + Date.now()
  }, 'r+'));
```
