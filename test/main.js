'use strict';

var fs = require('fs');
var should = require('should');
var path = require('path');
require('mocha');

var gutil = require('gulp-util');

var checksum = require('../');

var makeTestFile = function (filename) {
	var basePath = path.join(__dirname, './fixtures');
	var fullPath = path.join(basePath, filename);

	return new gutil.File({
		base: basePath,
		cwd: __dirname,
		path: fullPath,
		contents: fs.readFileSync(fullPath)
	});
};

describe(checksum.PLUGIN_NAME, function () {

	it('should rename resource with correct checksum', function (done) {

		var stream = checksum.resources();

		stream.on('error', function (err) {
			done(err);
		});

		var i = 0;
		stream.on('data', function (checksummedFile) {
			var checksummedPath = checksummedFile.path;

			if(checksummedFile.path.indexOf('fixtures/css/resource.css') !== -1) {
				checksummedPath.should.be.exactly(path.join(__dirname, './fixtures/css', '3cKrYQ.resource.css'));
				String(checksummedFile.contents).should.equal(String(makeTestFile('css/resource.css').contents));
			}

			if(checksummedFile.path.indexOf('fixtures/resource.css') !== -1) {
				checksummedPath.should.be.exactly(path.join(__dirname, './fixtures', '3cKrYQ.resource.css'));
				String(checksummedFile.contents).should.equal(String(makeTestFile('resource.css').contents));
			}

			if(checksummedFile.path.indexOf('fixtures/resource.js') !== -1) {
				checksummedPath.should.be.exactly(path.join(__dirname, './fixtures', '1swKGi.resource.js'));
				String(checksummedFile.contents).should.equal(String(makeTestFile('resource.js').contents));
			}

			if(++i >= 3) {
				done();
			}
		});

		stream.write(makeTestFile('resource.css'));
		stream.write(makeTestFile('css/resource.css'));
		stream.write(makeTestFile('resource.js'));
		stream.end();
	});
});

describe(checksum.PLUGIN_NAME, function () {

	it('should update reference with correct checksummed path, even if multiple have the same filename', function (done) {

		var stream = checksum.references();

		stream.on('error', function (err) {
			done(err);
		});

		var i = 0;
		stream.on('data', function (updatedFile) {
			if(updatedFile.path.indexOf('reference.html') !== -1) {
				String(updatedFile.contents).should.containEql('<link rel="stylesheet" href="css/3cKrYQ.resource.css">');
				String(updatedFile.contents).should.containEql('<link rel="stylesheet" href="3cKrYQ.resource.css">');
				String(updatedFile.contents).should.containEql('<script src="1swKGi.resource.js"></script>');
			}
			if(updatedFile.path.indexOf('reference.mustache') !== -1) {
				String(updatedFile.contents).should.containEql('<link rel="stylesheet" href="../css/3cKrYQ.resource.css">');
				String(updatedFile.contents).should.containEql('<link rel="stylesheet" href="../3cKrYQ.resource.css">');
				String(updatedFile.contents).should.containEql('<script src="../1swKGi.resource.js"></script>');
			}

			if(++i >= 2) {
				done();
			}
		});

		stream.write(makeTestFile('reference.html'));
		stream.write(makeTestFile('templates/reference.mustache'));
		stream.end();
	});
});
