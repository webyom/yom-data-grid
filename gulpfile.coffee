gulp = require 'gulp'
bundler = require 'gulp-amd-bundler'
less = require 'gulp-less'

gulp.task 'bundle', ->
	gulp.src(['src/yom-data-grid.js'])
		.pipe bundler
			beautifyTemplate: true
		.pipe gulp.dest('dist')
		#.pipe gulp.dest('../../ddicar/crm-ui/dist/browser/js/vendor/yom-data-grid')

gulp.task 'less', ->
	gulp.src(['src/yom-data-grid.less'])
		.pipe less()
		.pipe gulp.dest('dist')
		#.pipe gulp.dest('../../ddicar/crm-ui/dist/browser/css/vendor/yom-data-grid')

gulp.task 'default', ['bundle', 'less']