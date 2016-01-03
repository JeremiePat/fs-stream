fs-stream
===============================================================================

A wrapper and a set of utilities around [glob-stream](https://www.npmjs.com/package/glob-stream) to handle simple files manipulation through streams.

API
-------------------------------------------------------------------------------

### _module_(globPattern, [options])

Return a stream of file and dir. For a full documentation of `options` and glob pattern, go read the [glob-stream documentation](https://github.com/gulpjs/glob-stream).

### copy(dir, [options])

Copy all the files in the stream. `dir` can be:

* `String`: The path to the directory where to copy all the files
* `Function`: This function get the actual path to the file and must return the path to the directory where the file must be copied.

> **NOTE:** _relative path are resolved against the same base `cwd` as the one used to set up the stream._

The optional `options` parameter is an object with the following optionnal keys:
* `override`: A boolean indicating if the copy must override an existing file with the same name as the new one (default: **false**)
* `add`: A boolean indicating if the copied file must be added to the stream. (default: **false**)

```js
var fs = require('fs-stream');

fs('/files/*.md')
  .pipe(fs.copy('/files/markdown'), {add: true});
```

### create(path, [options])

Create a file or directory within each directory in the stream. `path` can be

* `String`: The relative path to the file in the current directory from the stream.
* `Function`: This function get the actual path to the directory and must return the relative path from that directory to the file to create.

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

* `String`: A glob pattern files must match.
* `Function`: This function get the actual path to the file and must return a glob pattern string.

> **NOTE:** _relative patterns are resolved against the same base `cwd` as the one used to set up the stream._

The optional `keep` parameter indicate if a file matching the pattern must be kept in (true) or excluded from (false) the stream (default: **true**)

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

The optional `override` parameter indicate that if a file with the same name exist in the target directory, it must be overriden (default: **true**)

If the path provide is something else than a directory, the parent directory will be used. If the directory provided does not exist, it is created automatically.

```js
var fs = require('fs-stream');

fs('/files/*.md')
  .pipe(fs.move('/files/markdown'));
```

