const electron = require('electron');
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

const {
  app
} = electron;

const {
  exec,
  execFile
} = childProcess;

const SEARCH_TIME = 1000;

export default class Capture {
  randomName() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; ++i) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  win32Capture(crop, cb) {
    const exePath = path.normalize(path.resolve(__dirname, 'resources', 'focus-capture.exe'));
    const imageName = `${this.randomName()}.png`;
    execFile(exePath, [crop.toString(), imageName], (err) => {
      if (err) {
        throw err;
      }

      // focus-capture stores the image in the temp folder
      const imagePath = path.join(app.getPath('temp'), imageName);
      cb(imagePath);
    });
  }

  darwinCapture(cb) {
    const cache = [];
    // Constantly search the desktop for new images taken by the user
    setInterval(() => {
      fs.readdir(app.getPath('desktop'), (err, files) => {
        if (err) {
          throw err;
        }

        if (files.length > 0) {
          // filter out any other types of files
          // we also want to filter out any files we have already checked
          const images = files.filter((file) => {
            return cache.includes(file) === false && /.png$/.test(file);
          });

          images.forEach((image) => {
            const imagePath = path.join(app.getPath('desktop'), image);
            const fileStats = fs.statSync(imagePath);

            // Skip files that are old
            if ((Date.now() - fileStats.ctime.getTime()) > 3000) {
              return;
            }

            exec(`/usr/bin/mdls --raw --name kMDItemIsScreenCapture "${imagePath}"`, (err, result) => {
              if (err) {
                throw err;
              }

              // add to cache so we don't process it again
              cache.push(image);

              // not a screenshot, so exit out
              if (parseInt(result, 10) === 0) {
                return;
              }
              cb(imagePath);
            });
          });
        }
      });
    }, SEARCH_TIME);
  }
}
