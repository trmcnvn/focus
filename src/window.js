const events = require('events');
const electron = require('electron');
const Positioner = require('electron-positioner');
const path = require('path');

const {
  EventEmitter
} = events;

const {
  BrowserWindow
} = electron;

export default class Window extends EventEmitter {
  constructor() {
    super();

    this.window = this.createWindow();
    this.events();
  }

  createWindow() {
    const window = new BrowserWindow({
      width: 450,
      height: 350,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      frame: false,
      show: false
    });
    window.loadURL(path.join(`file://${__dirname}/index.html`));
    return window;
  }

  events() {
    this.on('window:open', (bounds) => {
      if (this.window.isVisible() === true) {
        return this.window.hide();
      }
      this.updatePosition(bounds);
      this.window.show();
    });

    this.window.on('blur', () => {
      this.window.hide();
    });
  }

  updatePosition(bounds) {
    const positioner = new Positioner(this.window);
    if (bounds === undefined) {
      const position = process.platform === 'win32' ? 'bottomRight' : 'topRight';
      positioner.move(position);
    } else {
      positioner.move('trayCenter', bounds);
    }
    this.window.show();
  }

  browserWindow() {
    return this.window;
  }
}
