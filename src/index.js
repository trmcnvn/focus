const startTime = Date.now();
const electron = require('electron');

import Application from './application';

const {
  app,
  dialog
} = electron;

process.on('uncaughtException', (err) => {
  err = err || {};
  console.log('[Error]', err.message);
  console.log('[Error]', err.stack);
  dialog.showErrorBox('Uh oh. An unexpected error occurred.', err.message);
});

const shouldQuit = app.makeSingleInstance(() => { });
if (shouldQuit) {
  app.quit();
} else {
  app.on('ready', () => {
    new Application(); // eslint-disable-line
    console.log('[Startup]', Date.now() - startTime);
  });
}
