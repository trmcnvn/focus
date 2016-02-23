const events = require('events');
const electron = require('electron');

import Tray from './tray';

const {
  EventEmitter
} = events;

const {
  app,
  globalShortcut,
  dialog,
  ipcMain,
  BrowserWindow
} = electron;

export default class Application extends EventEmitter {
  constructor() {
    super();

    // Hide the process from the OS X dock
    if (process.platform === 'darwin') {
      app.dock.hide();
    }

    this.events();
    this.register();
    this.tray = new Tray();
  }

  events() {
    // electron app events
    app.on('will-quit', (event) => {
      globalShortcut.unregisterAll();
    });

    // local application events
    this.on('app:quit', () => {
      this.quit();
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

  quit() {
    app.quit();
  }
}
