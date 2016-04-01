const gulp = require('gulp');
const source = require('vinyl-source-stream');
const browserify = require('browserify');
const glob = require('glob');
const es = require('event-stream');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const eslint = require('gulp-eslint');
const rename = require('gulp-rename');
const useref = require('gulp-useref');
const replace = require('gulp-replace');
const electron = require('electron-connect').server.create();
const electronPackager = require('gulp-atom-electron');
const symdest = require('gulp-symdest');
const zip = require('gulp-vinyl-zip');
const packageJson = require('./package.json');

/* Builing Tasks */
gulp.task('build-client-bundles', (done) => {
  glob('./app/js/*.js', (err, files) => {
    if (err) {
      done(err);
    }

    const tasks = files.map((entry) => {
      return browserify({ entries: [entry] })
        .transform('babelify', { presets: [ 'es2015', 'react' ] })
        .bundle()
        .pipe(source(entry))
        .pipe(rename({
          dirname: 'js'
        }))
        .pipe(gulp.dest('./build'));
    });
    es.merge(tasks).on('end', done);
  });
});

gulp.task('build-client-scss', (done) => {
  glob('./app/scss/*.scss', (err, files) => {
    if (err) {
      done(err);
    }

    const tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(sass())
        .pipe(rename({
          dirname: 'css'
        }))
        .pipe(gulp.dest('./build'));
    });
    es.merge(tasks).on('end', done);
  });
});

gulp.task('build-client-html', (done) => {
  glob('./app/*.html', (err, files) => {
    if (err) {
      done(err);
    }

    const tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(gulp.dest('./build'));
    });
    es.merge(tasks).on('end', done);
  });
});

gulp.task('build-client-html-production', (done) => {
  glob('./app/*.html', (err, files) => {
    if (err) {
      done(err);
    }

    const tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(useref())
        .pipe(gulp.dest('./build'));
    });
    es.merge(tasks).on('end', done);
  });
});

gulp.task('build-client', ['build-client-bundles', 'build-client-scss',
  'build-client-html']);
gulp.task('build-client-production', ['build-client-bundles', 'build-client-scss',
  'build-client-html-production']);

gulp.task('build-server', (done) => {
  glob('./src/*.js', (err, files) => {
    if (err) {
      done(err);
    }

    const tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(gulp.dest('./build'));
    });
    es.merge(tasks).on('end', done);
  });
});

gulp.task('copy-platform-resources', (done) => {
  glob(`./resources/${process.platform}/*`, (err, files) => {
    if (err) {
      done(err);
    }
    if (files.length === 0) { done(); }

    const tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(rename({
          dirname: 'resources'
        }))
        .pipe(gulp.dest('./build'));
    });
    es.merge(tasks).on('end', done);
  });
});

gulp.task('copy-global-resources', (done) => {
  glob('./resources/*', { nodir: true }, (err, files) => {
    if (err) {
      done(err);
    }

    const tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(rename({
          dirname: 'resources'
        }))
        .pipe(gulp.dest('./build'));
    });
    es.merge(tasks).on('end', done);
  });
});

gulp.task('copy-node-modules', (done) => {
  glob('./node_modules/**/*', (err, files) => {
    if (err) {
      done(err);
    }

    // not all packages are needed, some are already included by browserify
    const packages = [
      'auto-launch',
      'electron-positioner',
      'request',
      'trash'
    ];

    files = files.filter((entry) => {
      const packageName = entry.match(/\.\/node_modules\/(\S+?(?=\/|$))/);
      return packageName && packages.indexOf(packageName[1]) !== -1;
    });

    const tasks = files.map((entry) => {
      return gulp.src(entry, { base: '.' })
        .pipe(gulp.dest('./build'));
    });
    es.merge(tasks).on('end', done);
  });
});

gulp.task('copy-resources', ['copy-platform-resources', 'copy-global-resources', 'copy-node-modules']);

gulp.task('build', ['build-client', 'build-server', 'copy-resources']);

gulp.task('build-production', ['build-client-production', 'build-server',
  'copy-resources'],
  () => {
    gulp.src('./package.json')
      .pipe(replace('build/index.js', 'index.js'))
      .pipe(gulp.dest('./build'));
  }
);

/* Watchers */
gulp.task('watch-client', () => {
  gulp.watch('./app/**/*', ['build-client'], (e) => {
    console.log('Client file ' + e.path + ' was ' + e.type + ', rebuilding...');
  });
});

gulp.task('watch-server', () => {
  gulp.watch('./src/**/*', ['build-server'], (e) => {
    console.log('Server file ' + e.path + ' was ' + e.type + ', rebuilding...');
  });
});

gulp.task('watch-resources', () => {
  gulp.watch('./resources/**/*', ['copy-resources'], (e) => {
    console.log('Resource file ' + e.path + ' was ' + e.type + ', rebuilding...');
  });
})

gulp.task('watch', ['watch-client', 'watch-server', 'watch-resources']);

/* Linters */
gulp.task('lint-client', (done) => {
  glob('./app/**/*.js', (err, files) => {
    if (err) {
      done(err);
    }

    const tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(eslint())
        .pipe(eslint.format());
    });
    es.merge(tasks).on('end', done);
  });
});

gulp.task('lint-server', (done) => {
  glob('./src/**/*.js', (err, files) => {
    if (err) {
      done(err);
    }

    const tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(eslint())
        .pipe(eslint.format());
    });

    es.merge(tasks).on('end', done);
  });
});

gulp.task('lint', ['lint-client', 'lint-server']);

/* Serve */
gulp.task('serve', ['build', 'watch'], () => {
  electron.start();
  gulp.watch('./build/index.js', electron.restart);
  gulp.watch(['./build/js/*.js', './build/css/*.css'], electron.reload);
});

/* Release */
gulp.task('package-osx', ['build-production'], () => {
  return gulp.src('./build/**')
    .pipe(electronPackager({
      version: packageJson.electronVersion,
      platform: 'darwin',
      arch: 'x64',
      copyright: '© Thomas McNiven',
      darwinIcon: './resources/darwin/app.icns',
      darwinBundleIdentifier: 'net.vevix.focus'
    }))
    .pipe(symdest('release'));
});

gulp.task('package-windows', ['build-production'], () => {
  return gulp.src('./build/**')
    .pipe(electronPackager({
      version: packageJson.electronVersion,
      platform: 'win32',
      arch: 'x64',
      copyright: '© Thomas McNiven',
      winIcon: './resources/win32/app.ico'
    }))
    .pipe(zip.dest('./release/windows.zip'));
});

gulp.task('package', ['build-production', 'package-windows', 'package-osx']);
