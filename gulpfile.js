
// Require Gulp the plugins to be used, assigning each to variable.
var gulp = require('gulp'),
	batch = require('gulp-batch'),
	concat = require('gulp-concat'),
	notify = require('gulp-notify'),
	plumber = require('gulp-plumber'),
	rename = require('gulp-rename'),
	watch = require('gulp-watch'),
	concat = require('gulp-concat'),
	shell = require('gulp-shell'),
	uglify = require('gulp-uglify');

// Hello world task.
gulp.task('hello-world', function() {
	return gulp.src('').pipe(notify('Hello world!'));
});

// === STYLES ===

// COMPILING SASS.
// ---------------

// Define a task called 'styles-compile' to compile our Sass/Compass project
// and trigger an OS-level notification when complete.
//
// Since we already have our Compass configurations in config.rb, we'll just
// use the shell plugin to run the Compass compiler for us.

gulp.task('styles-compile', function() {
	// There's no source file required for this, but we still want to
	// be able to use pipe(). So, we pass an empty string to src().
	return gulp.src('')
		.pipe(plumber()) // Using plumber() here allows the task to recover from compilation errors.
		.pipe(shell(['compass compile'])) // Pass shell() an array of shell commands to execute.
		.pipe(notify('Compiled styles')); // Display a notification when done.
})

// MONITORING SASS FILES FOR CHANGES.
// ----------------------------------

// Define an ongoing task that will automatically run our styles-compile task when a Sass file is changed.
gulp.task('styles-watch', function() {
	// We provide the watch plugin with a glob of files to monitor, then use the batch plugin
	// throttle execution of the styles-compile task.
	watch('./assets/styles.source/**/*.scss', batch(function(events, done) {
		gulp.start('styles-compile', done);
	}));
})

// === JS ===

// The directory where we'll store our resulting JS files.
var compiledJsDir = './assets/js.compiled/';

// CONCATENATING JAVASCRIPT FILES.
// -------------------------------

// Define an array of JS files we want to combine.
var jsToConcat = [
	'./assets/js.source/vendor/jquery-1.11.2.js',
	'./assets/js.source/others/**/*.js', // matches all files in other/ and any subdirectories it has.
	'./assets/js.source/main.js'
];

// The name we want to use for our combined JS file.
var jsDestinationFile = 'combined.js';

// Define a task called 'js-concat' to concatenate our JS files and trigger an OS-level notification when complete.
gulp.task('js-concat', function() {
	return gulp
		.src(jsToConcat) // Provide the array of files to be combined as to gulp.src()
		.pipe(concat(jsDestinationFile)) // Pipe them to the concat() plugin, providing the name of a destination file
		.pipe(gulp.dest(compiledJsDir)) // And send that to the destination directory
		.pipe(notify('Combined JS files')); // Let it be known
});

// MINIMIZING JS.
// --------------

// Define a task called 'js-minify' to minify our combined JS and trigger an OS-level notification when complete.
gulp.task('js-minify', ['js-concat'], function() { // second arg is array of tasks that must be completed first.
	return gulp
		.src(compiledJsDir + jsDestinationFile) // Grab the newly concatenated JS file
		.pipe(uglify()) // Pipe that to the uglify plugin to minify it
		.pipe(rename({  // Rename this minified version to end with .min.js
			extname: '.min.js'
		}))
		.pipe(gulp.dest(compiledJsDir)) // Send that to the compiled files directory
		.pipe(notify('Minified JS'));
});

// MONITORING JS FILES FOR CHANGES.
// --------------------------------

// Define an ongoing task that will automatically run our js-minify task when a JS file is changed.
gulp.task('js-watch', function() {
	// We provide the watch plugin with a glob of files to monitor, then use the batch plugin
	// throttle execution of the js-minify task.
	watch('./assets/js.source/**/*.js', batch(function(events, done) {
		gulp.start('js-minify', done);
	}));
})

// === OTHER ===

// COMPLETE BUILD.
// ---------------
gulp.task('build', ['styles-compile', 'js-minify'], function() {
	return gulp.src('').pipe(notify('Build complete!'));
});
