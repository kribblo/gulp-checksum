# gulp-checksum

Generates checksums out of static resources and renames the files accordingly - this makes a unique filename for each version of the file so that HTTP headers can be set to cache forever.

Can also update references to the resources with checksum using the `references()` call, just make sure that all calls to `resources()` is done before.  

*gulp-checksum* correctly handles relative URLs, even if multiple resources in the tree have the same filename.

## Example

```js
var gulp = require('gulp');
var checksum = require('gulp-checksum');

gulp.task('css', function () {
    return gulp.src('css/*.css')
        .pipe(checksum.resources())
        .pipe(gulp.dest('dist/css'));
});

gulp.task('html', ['css'], function () {
    return gulp.src('*.html')
        .pipe(checksum.references())
        .pipe(gulp.dest('dist'));
});
```

## Test

	npm test
	
