const electron = require('electron');
const path = require('path');
const fs = require('fs');

const {
  app
} = electron;

export default class Settings {
  constructor() {
    this.filePath = path.join(app.getPath('userData'), 'settings.json');
    this.settings = JSON.parse(this._createOrLoadSettings());
  }

  get(type, key) {
    return this.settings[type][key];
  }

  set(type, key, value) {
    this.settings[type][key] = value;
  }

  save() {
    const settings = JSON.stringify(this.settings);
    fs.writeFileSync(this.filePath, settings);
  }

  getObject() {
    return this.settings;
  }

  _createOrLoadSettings() {
    let file;
    try {
      file = fs.readFileSync(this.filePath);
    } catch (_) {
      // Copy over the default Settings
      const localPath = path.normalize(path.resolve(__dirname, 'resources', 'settings.json'));
      fs.createReadStream(localPath).pipe(fs.createWriteStream(this.filePath));
      file = fs.readFileSync(this.filePath);
    }
    return file;
  }
}
