const gulp = require('gulp');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');

gulp.task('build', () => gulp.src('src/**/*.es')
  .pipe(babel())
  .pipe(gulp.dest('./public/')));

gulp.task('watch', () => {
  gulp.watch('src/**/*.es', gulp.task('build'));
});

gulp.task('check-style', () => gulp.src(['src/**/*.es'])
  .pipe(eslint({ configFile: '.eslintrc.json' }))
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));

gulp.task('default', gulp.series('build'));
