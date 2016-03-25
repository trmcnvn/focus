const request = require('request');
const dialog = require('electron').dialog;
const fs = require('fs');

export default class Uploader {
  constructor() {
    this.clientId = '15523f4ea794178';
  }

  upload(file) {
    const data = {
      image: fs.createReadStream(file)
    };

    // emit events... (Started, Completed, Failed)
    this._buildRequest('POST', 'upload', data, (err, _, body) => {
      if (err) {
        // todo: retry options
        dialog.showErrorBox('Failed to upload image', err.message);
      }

      // ...
      console.log(JSON.parse(body).data.link);
    });
  }

  _buildRequest(method, endpoint, data, cb) {
    const options = {
      method,
      url: `https://api.imgur.com/3/${endpoint}`,
      headers: {
        'Authorization': `Client-ID ${this.clientId}`
      }
    };
    if (data !== undefined || data !== null) {
      options.formData = data;
    }
    request(options, cb);
  }
}
