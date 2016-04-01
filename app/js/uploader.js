const electron = window.require('electron');

const {
  ipcRenderer,
  clipboard
} = electron;

module.exports = () => {
  ipcRenderer.on('upload:complete', (_, json, file) => {
    const settings = JSON.parse(window.localStorage.getItem('settings'));
    if (settings.images.copy) {
      ipcRenderer.send('image:copy', json.data.id, file);
    } else if (settings.images.delete) {
      ipcRenderer.send('image:delete', file);
    }

    if (settings.general.clipboard) {
      clipboard.writeText(json.data.link);
    }

    if (settings.notifications.enabled) {
      const notification = new Notification('Upload Complete', {
        body: 'Your image has been uploaded!'
      });
      notification.onclick = () => {
        clipboard.writeText(json.data.link);
      };
    }

    // push into our storage
    const images = JSON.parse(window.localStorage.getItem('images')) || [];
    images.push({
      id: json.data.id,
      deleteHash: json.data.deletehash,
      link: json.data.link
    });
    window.localStorage.setItem('images', JSON.stringify(images));

    // Update state
    window.Events.emit('images:updated');
  });

  ipcRenderer.on('delete:complete', (_, hash) => {
    // Remove image from storage array
    const images = JSON.parse(window.localStorage.getItem('images'));
    const image = images.find((element) => element.deleteHash === hash);
    if (image !== undefined) {
      images.splice(images.indexOf(image), 1);
      window.localStorage.setItem('images', JSON.stringify(images));
    }

    // Update state on react component
    window.Events.emit('images:updated');
  });
};
