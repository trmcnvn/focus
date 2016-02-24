const electron = require('electron');
const path = require('path');

const {
  app,
  Tray: ElectonTray
} = electron;

export default class Tray {
  constructor(window) {
    this.window = window;
    this.tray = this.createTrayIcon();
    this.events();
  }

  createTrayIcon() {
    const images = path.normalize(path.resolve(__dirname, 'resources'));
    const tray = new ElectonTray(path.join(images, 'tray.png'));
    tray.setHighlightMode(false);
    tray.setToolTip(`Focus - Version ${app.getVersion()}`);
    return tray;
  }

  events() {
    this.tray.on('click', (event, bounds) => {
      this.window.emit('window:open', bounds);
    });
  }
}
