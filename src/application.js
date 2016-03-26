const electron = require('electron');
const fs = require('fs');
const path = require('path');

import Tray from './tray';
import Window from './window';
import Settings from './settings';
import Capture from './capture';
import Uploader from './uploader';

const {
  app,
  globalShortcut,
  dialog,
  clipboard,
  ipcMain
} = electron;

export default class Application {
  constructor() {
    // Hide the process from the OS X dock
    if (process.platform === 'darwin') {
      app.dock.hide();
    }

    this.window = new Window();
    this.settings = new Settings();
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

    // app events
    ipcMain.on('renderer:loaded', (event) => {
      event.sender.send('settings', this.settings.getObject());
      event.sender.send('initialize');
    });

    ipcMain.on('settings:change', (_, type, key, value) => {
      this.settings.set(type, key, value);
      this.settings.save();
    });

    // uploader events
    this.uploader.on('uploader:upload-started', () => {
      // TODO: change tray icon
    });

    this.uploader.on('uploader:upload-failed', (err, file) => {
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
      if (this.settings.get('images', 'copy')) {
        let copyPath = path.join(app.getPath('pictures'), 'Focus');
        try {
          fs.mkdirSync(copyPath);
        } catch (error) {
          if (error.code !== 'EEXIST') {
            throw error;
          }
        }

        copyPath = path.join(copyPath, `${json.data.id}.png`);
        fs.createReadStream(file).pipe(fs.createWriteStream(copyPath));
        // delete the source images
        fs.unlink(file);
      } else if (this.settings.get('images', 'delete')) {
        fs.unlink(file);
      }

      if (this.settings.get('general', 'clipboard')) {
        clipboard.writeText(json.data.link);
      }

      // notify the browser process of a completed upload
      if (this.settings.get('notifications', 'general')) {
        this.window.webContents().send('notification:general', {
          title: 'Upload Complete',
          body: 'Your screenshot has been successfully uploaded to imgur',
          link: json.data.link
        });
      }

      if (this.settings.get('notifications', 'audio')) {
        this.window.webContents().send('notification:audio');
      }
    });

    this.uploader.on('uploader:delete-started', () => {
      // ... feedback
    });

    this.uploader.on('uploader:delete-failed', (err, id) => {
      const response = dialog.showMessageBox({
        type: 'error',
        buttons: ['Retry', 'Cancel'],
        defaultId: 0,
        title: 'An error has occurred',
        message: 'There was an error deleting the image',
        detail: err.message
      });

      if (response === 0) { // Retry
        this.uploader.delete(id);
      }
    });

    this.uploader.on('uploader:delete-complete', () => {
      // ... feedback
    });
  }

  register() {
    const upload = (file) => {
      this.uploader.upload(file);
    };

    // These hotkeys are already built into OS X, so we are going to read
    // the Desktop for images taken with the system, and upload them.
    if (process.platform === 'darwin') {
      this.capture.darwinCapture(upload);
    } else if (process.platform === 'win32') {
      globalShortcut.register('ctrl+shift+3', () => {
        this.win32Capture(false, upload);
      });

      globalShortcut.register('ctrl+shift+4', () => {
        this.win32Capture(true, upload);
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
