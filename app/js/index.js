// Node require's
const electron = window.require('electron');

// Browserify includes
window.React = require('react');
window.jQuery = require('../../node_modules/jquery/dist/jquery');
require('../../node_modules/bootstrap/dist/js/bootstrap');

const ReactDOM = require('react-dom');
const Index = require('./components/index');

const {
  ipcRenderer,
  clipboard
} = electron;

// Initialize settings
const settings = window.localStorage.getItem('settings');
if (settings === null) {
  const defaultSettings = {
    general: {
      clipboard: true
    },
    images: {
      copy: false,
      delete: true
    },
    notifications: {
      general: true,
      audio: true
    }
  };
  window.localStorage.setItem('settings', JSON.stringify(defaultSettings));
}

// Listen for events
ipcRenderer.on('upload:complete', (_, json, file) => {
  // check settings to see if we should copy, or delete this file
  const settings = JSON.parse(window.localStorage.getItem('settings'));
  if (settings.images.copy) {
    ipcRenderer.send('image:copy', json.data.id, file);
  } else if (settings.images.delete) {
    ipcRenderer.send('image:delete', file);
  }

  if (settings.general.clipboard) {
    clipboard.writeText(json.data.link);
  }

  if (settings.notifications.general) {
    const notification = new Notification('Upload Complete', {
      body: 'Your image has been uploaded!'
    });
    notification.onclick = () => {
      clipboard.writeText(json.data.link);
    };
  }

  if (settings.notifications.audio) {
    // ...
  }

  // push into our storage
  const images = JSON.parse(window.localStorage.getItem('images')) || [];
  console.log(json);
  images.push({
    id: json.data.id,
    deleteHash: json.data.deletehash,
    link: json.data.link
  });
  window.localStorage.setItem('images', JSON.stringify(images));
});

// Initialize react code
ReactDOM.render(
  <Index />,
  document.getElementById('content')
);
