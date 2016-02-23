const electron = window.require('electron');

const {
  ipcRenderer
} = electron;

window.onload = () => {
  ipcRenderer.send('from-app', 'window:loaded');
};
