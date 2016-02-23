const startTime = Date.now();
const electron = require('electron');
const dialog = require('dialog');

const {
    app
} = electron;

process.on('uncaughtException', (err) => {
  err = err || {};
  console.log('[Error]', err.message);
  console.log('[Error]', err.stack);
  dialog.showErrorBox('Uh oh. An unexpected error occurred.', err.message);
});

app.on('ready', () => {
  // ...
  console.log('[Startup]', Date.now() - startTime);
});
