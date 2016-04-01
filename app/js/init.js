const electron = window.require('electron');
const events = window.require('events');

const {
  ipcRenderer
} = electron;

const {
  EventEmitter
} = events;

class Emitter extends EventEmitter {}
window.Events = new Emitter();

module.exports = () => {
  const settings = window.localStorage.getItem('settings');
  if (settings === null) {
    const defaultSettings = {
      general: {
        launch: true,
        clipboard: true
      },
      images: {
        copy: false,
        delete: true
      },
      notifications: {
        enabled: true
      }
    };
    window.localStorage.setItem('settings', JSON.stringify(defaultSettings));
  }
  ipcRenderer.send('settings', JSON.parse(settings));
};
