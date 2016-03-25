const electron = require('electron');
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

import Tray from './tray';
import Window from './window';
import Uploader from './uploader';

const {
  app,
  globalShortcut,
  dialog,
  clipboard
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
    this.uploader = new Uploader();

    this.events();
    this.register();
  }

  events() {
    // electron app events
    app.on('will-quit', (event) => {
      this.unregister();
    });

    // uploader events
    this.uploader.on('uploader:upload-started', () => {
      // TODO: Feedback
    });

    this.uploader.on('uploader:upload-failed', (err, file) => {
      // TODO: Retry events
      const response = dialog.showMessageBox({
        type: 'error',
        buttons: ['Retry', 'Cancel'],
        defaultId: 0,
        title: 'An error has occurred',
        message: 'There was an error uploading the image',
        detail: err.message
      });

      if (response === 0) { // Retry
        this.uploader.upload(file);
      }
    });

    this.uploader.on('uploader:upload-complete', (json, file) => {
      // TODO: Base on settings
      fs.unlink(file);

      // store details on the image

      // TODO: Base on settings
      // Copy link to clipboard
      clipboard.writeText(json.data.link);

      // TODO: Notify user of completetion
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
    execFile(exePath, [crop.toString(), imageName], (err) => {
      if (err) {
        throw err;
      }

      // focus-capture stores the image in the temp folder
      const imagePath = path.join(app.getPath('temp'), imageName);
      this.uploader.upload(imagePath);
    });
  }

  darwinCapture() {
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
              this.uploader.upload(imagePath);
            });
          });
        }
      });
    }, SEARCH_TIME);
  }
}
