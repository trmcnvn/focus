const events = require('events');
const electron = require('electron');
const path = require('path');

const {
  EventEmitter
} = events;

const {
  app,
  Tray: ElectonTray,
  Menu
} = electron;

export default class Tray extends EventEmitter {
  constructor() {
    super();
    this.tray = this.createTrayIcon();
    this.events();
  }

  createTrayIcon() {
    const images = path.normalize(path.resolve(__dirname, 'assets'));
    const tray = new ElectonTray(path.join(images, 'tray.png'));
    tray.setPressedImage(path.join(images, 'tray-pressed.png'));
    tray.setToolTip(`Focus - Version ${app.getVersion()}`);
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Recent Uploads', click: () => { this.recent(); } },
      { label: 'Settings', click: () => { this.settings(); } },
      { type: 'separator' },
      { label: 'Quit', click: () => { this.quit(); } }
    ]));
    return tray;
  }

  events() {
    this.tray.on('click', (event, bounds) => {
      console.log('hello');
      console.log(...arguments);
      this.bounds = bounds;
    });

    if (process.platform === 'win32') {
      this.tray.on('double-click', () => {
        this.recent();
      });
    }
  }

  recent() {
    global.application.emit('app:recent');
  }

  settings() {
    global.application.emit('app:settings', this.bounds);
  }

  quit() {
    global.application.emit('app:quit');
  }
}
