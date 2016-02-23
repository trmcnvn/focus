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
      { label: 'Recent Uploads', click: () => { global.application.emit('app:recent'); } },
      { label: 'Settings', click: () => { global.application.emit('app:settings'); } },
      { type: 'separator' },
      { label: 'Quit', click: () => { global.application.emit('app:quit'); } }
    ]));
    return tray;
  }

  events() {
    this.tray.on('double-click', () => {
      global.application.emit('app:recent');
    });

    if (process.platform === 'darwin') {
      /*
      this.tray.on('drop-files', (event, files) => {

      });
      */
    }
  }
}
