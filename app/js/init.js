const electron = window.require('electron');

const {
  ipcRenderer
} = electron;

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
