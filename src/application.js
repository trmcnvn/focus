const electron = require('electron');
const fs = require('fs');

import Tray from './tray';
import Window from './window';
import Capture from './capture';
import Uploader from './uploader';

const {
  app,
  globalShortcut,
  dialog,
  clipboard
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

    // uploader events
    this.uploader.on('uploader:upload-started', () => {
      // TODO: change tray icon
      console.log('upload started');
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
      // TODO: Base on settings
      fs.unlink(file);

      // store details on the image
      console.log(json.data);

      // TODO: Base on settings
      // Copy link to clipboard
      clipboard.writeText(json.data.link);

      // TODO: Notify user of completetion
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
