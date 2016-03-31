const electron = require('electron');
const path = require('path');
const events = require('events');

const {
  app,
  Tray: ElectonTray
} = electron;

const {
  EventEmitter
} = events;

export default class Tray extends EventEmitter {
  constructor(window) {
    super();
    this.window = window;
    this.tray = this.createTrayIcon();
    this.events();
  }

  createTrayIcon() {
    const icon = this.getIconPath();
    const tray = new ElectonTray(icon);
    tray.setHighlightMode(false);
    tray.setToolTip(`Focus - Version ${app.getVersion()}`);
    return tray;
  }

  getIconPath(icon) {
    let iconName = icon;
    if (iconName === undefined) {
      iconName = 'tray.png';
      if (process.platform === 'darwin' && app.isDarkMode()) {
        iconName = 'tray-dark.png';
      }
    }
    const images = path.normalize(path.resolve(__dirname, 'resources'));
    return path.join(images, iconName);
  }

  events() {
    if (process.platform === 'darwin') {
      app.on('platform-theme-changed', () => {
        const icon = this.getIconPath();
        this.tray.setImage(icon);
      });
    }

    this.tray.on('click', (event, bounds) => {
      this.window.emit('window:open', bounds);
    });

    this.on('icon:upload', () => {
      const icon = this.getIconPath('tray-upload.png');
      this.tray.setImage(icon);
    });

    this.on('icon:reset', () => {
      const icon = this.getIconPath();
      this.tray.setImage(icon);
    });
  }
}
