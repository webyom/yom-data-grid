var gulp = require('gulp');
var bundler = require('gulp-amd-bundler');

gulp.task('bundle', function() {
	gulp.src(['src/yom-data-grid.js'])
		.pipe(bundler({
			beautifyTemplate: true
		}))
		.pipe(gulp.dest('dist'));
		//.pipe(gulp.dest('../react-router-redux-demo/dist/js/vendor/yom-data-grid'))
		//.pipe(gulp.dest('../react-router-redux-demo/node_modules/yom-data-grid/dist'));
});

gulp.task('default', ['bundle']);