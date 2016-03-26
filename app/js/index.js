const electron = window.require('electron');

window.React = require('react');
window.jQuery = require('../../node_modules/jquery/dist/jquery');
require('../../node_modules/bootstrap/dist/js/bootstrap');

const ReactDOM = require('react-dom');
const Index = require('./components/index');

const {
  ipcRenderer,
  clipboard
} = electron;

ipcRenderer.send('renderer:loaded');

ipcRenderer.once('initialize', () => {
  ReactDOM.render(
    <Index />,
    document.getElementById('content')
  );
});

ipcRenderer.on('settings', (_, data) => {
  window.Settings = data;
});

ipcRenderer.on('notification:general', (_, data) => {
  const notification = new Notification(data.title, { body: data.body });
  notification.onclick = () => {
    clipboard.writeText(data.link);
  };
});

ipcRenderer.on('notification:audio', () => {
  // TODO
});
