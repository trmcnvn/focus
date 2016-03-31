const electron = require('electron');
const fs = require('fs');
const path = require('path');
const AutoLaunch = require('auto-launch');

import Window from './window';
import Tray from './tray';
import Capture from './capture';
import Uploader from './uploader';

const {
  app,
  globalShortcut,
  dialog,
  ipcMain
} = electron;

export default class Application {
  constructor() {
    // Hide the process from the OS X dock
    if (process.platform === 'darwin') {
      app.dock.hide();
    }

    this.window = new Window();
    this.tray = new Tray(this.window);
    this.capture = new Capture();
    this.uploader = new Uploader();

    this.events();
    this.register();
  }

  events() {
    // electron app events
    app.on('will-quit', (event) => {
      this.unregister();
    });

    ipcMain.on('settings', (_, settings) => {
      const launch = new AutoLaunch({
        name: app.getName()
      });

      launch.isEnabled((enabled) => {
        const option = settings.general.launch;
        if (option && !enabled) {
          launch.enable((err) => {
            if (err) {
              throw err;
            }
          });
        } else if (!option && enabled) {
          launch.disable((err) => {
            if (err) {
              throw err;
            }
          });
        }
      });
    });

    ipcMain.on('image:copy', (_, id, file) => {
      let copyPath = path.join(app.getPath('pictures'), 'Focus');
      try {
        fs.mkdirSync(copyPath);
      } catch (error) {
        if (error.code !== 'EEXIST') {
          throw error;
        }
      }

      copyPath = path.join(copyPath, `${id}.png`);
      fs.createReadStream(file).pipe(fs.createWriteStream(copyPath));
      // delete the source images
      fs.unlink(file);
    });

    ipcMain.on('image:delete', (_, file) => {
      fs.unlink(file);
    });

    // Uploader
    this.uploader.on('upload:started', () => {
      this.tray.emit('icon:upload');
    });

    this.uploader.on('upload:error', (err, file) => {
      this.tray.emit('icon:reset');
      const response = dialog.showMessageBox({
        type: 'error',
        buttons: ['Retry', 'Cancel'],
        title: 'Upload Error',
        message: 'There was an issue uploading the image',
        detail: err.message
      });

      if (response === 0) {
        this.uploader.upload(file);
      }
    });

    this.uploader.on('upload:complete', (json, file) => {
      this.window.webContents().send('upload:complete', json, file);
      this.tray.emit('icon:reset');
    });
  }

  register() {
    const callback = (file) => {
      this.uploader.upload(file);
    };

    // These hotkeys are already built into OS X, so we are going to read
    // the Desktop for images taken with the system, and upload them.
    if (process.platform === 'darwin') {
      this.capture.darwinCapture(callback);
    } else if (process.platform === 'win32') {
      globalShortcut.register('ctrl+shift+3', () => {
        this.capture.win32Capture(false, callback);
      });

      globalShortcut.register('ctrl+shift+4', () => {
        this.capture.win32Capture(true, callback);
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
}
