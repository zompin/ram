'use strict';

let gulp 	   = require('gulp');
let less 	   = require('gulp-less');
let sourcemaps = require('gulp-sourcemaps');
let babel  	   = require('gulp-babel');
let bs 		   = require('browser-sync').create();
let exec	   = require('child_process').exec;

gulp.task('default', ['bs', 'less', 'babel'], function() {
	gulp.watch('./src/less/*.less', ['less']);
	gulp.watch('./src/js/*.jsx', ['babel']);
});

gulp.task('less', function() {
	return gulp.src('./src/less/*.less')
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./dist/css/'))
});

gulp.task('bs', function() {
	bs.init({
		notify: false,
		proxy: 'ram',
		files: ['./*.php', './dist/js/*.js', './dist/css/*.css']
	});
});

gulp.task('babel', function() {
	return gulp.src('./src/js/*.jsx')
		.pipe(sourcemaps.init())
		.pipe(babel({
			presets: ['es2015', 'react']
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./dist/js/'));
});