const electron = require('electron');
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

import Tray from './tray';
import Window from './window';

const {
  app,
  globalShortcut
} = electron;

const {
  exec,
  execFile
} = childProcess;

const SEARCH_TIME = 1000;

export default class Application {
  constructor() {
    // Hide the process from the OS X dock
    if (process.platform === 'darwin') {
      app.dock.hide();
    }

    this.window = new Window();
    this.tray = new Tray(this.window);

    this.events();
    this.register();
  }

  events() {
    // electron app events
    app.on('will-quit', (event) => {
      this.unregister();
    });
  }

  register() {
    if (process.platform === 'darwin') {
      // These hotkeys are already built into OS X, so we are going to read
      // the Desktop for images taken with the system, and upload them.
      this.darwinCapture();
    } else if (process.platform === 'win32') {
      globalShortcut.register('ctrl+shift+3', () => {
        this.win32Capture(false);
      });

      globalShortcut.register('ctrl+shift+4', () => {
        this.win32Capture(true);
      });

      if (globalShortcut.isRegistered('ctrl+shift+3') === false ||
          globalShortcut.isRegistered('ctrl+shift+4') === false) {
        throw new Error('There was a problem registering the global shortcuts. The application may not work as expected.');
      }
    }
  }

  unregister() {
    globalShortcut.unregisterAll();
  }


  randomName() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; ++i) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  win32Capture(crop) {
    const exePath = path.normalize(path.resolve(__dirname, 'resources', 'focus-capture.exe'));
    const imageName = `${this.randomName()}.png`;
    execFile(`${exePath}`, [crop.toString(), imageName], (err) => {
      if (err) {
        throw err;
      }

      // focus-capture stores the image in the temp folder
      const imagePath = path.join(app.getPath('temp'), imageName);

      // todo: upload

      // delete the file from temp dir.
      fs.unlink(imagePath);
    });
  }

  darwinCapture() {
    let cache = [];
    setInterval(() => {
      fs.readdir(app.getPath('desktop'), (err, files) => {
        if (err) {
          throw err;
        }

        if (files.length > 0) {
          // we only care about image files (PNG)
          const images = files.filter((file) => {
            return (cache.indexOf(file) === -1 && /.png$/.test(file))
              ? true : false;
          });
          images.forEach((file) => {
            const filePath = path.join(app.getPath('desktop'), file);
            const fileStats = fs.statSync(filePath);
            // Skip files that are old
            if ((Date.now() - fileStats.ctime.getTime()) > 3000) {
              return;
            }
            exec(`/usr/bin/mdls --raw --name kMDItemIsScreenCapture "${filePath}"`, (err, result) => {
              if (err) {
                throw err;
              }
              // not a screenshot
              if (parseInt(result) === 0) {
                cache.splice(cache.indexOf(file), 1);
                return;
              }
              // todo: upload
            });
            cache = files;
          });
        }
      });
    }, SEARCH_TIME);
  }
}
