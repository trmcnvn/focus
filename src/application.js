const electron = require('electron');
const path = require('path');

import Tray from './tray';
import Window from './window';

const {
  app,
  globalShortcut,
  dialog,
  ipcMain,
  BrowserWindow
} = electron;

export default class Application {
  constructor() {
    // Hide the process from the OS X dock
    if (process.platform === 'darwin') {
      app.dock.hide();
    }

    this.events();
    this.register();
    this.window = new Window();
    this.tray = new Tray(this.window);
  }

  events() {
    // electron app events
    app.on('will-quit', (event) => {
      this.unregister();
    });

    // events from the renderer process
    ipcMain.on('from-app', (event, command, ...args) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      window.emit(command, ...args);
    });
  }

  register() {
    const shortcut = 'CommandOrControl+Shift+1';
    globalShortcut.register(shortcut, () => {
      console.log('Hotkey Used');
      // ...
    });

    if (globalShortcut.isRegistered(shortcut) === false) {
      dialog.showErrorBox('Error', 'There was a problem registering the global shortcuts. The application may not work as expected.');
    }
  }

  unregister() {
    globalShortcut.unregisterAll();
  }
}
