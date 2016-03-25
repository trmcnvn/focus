const request = require('request');
const fs = require('fs');
const events = require('events');

const {
  EventEmitter
} = events;

export default class Uploader extends EventEmitter {
  constructor() {
    super();
    this.clientId = '15523f4ea794178';
  }

  upload(file) {
    const data = {
      image: fs.createReadStream(file)
    };

    this.emit('uploader:upload-started');
    this._buildRequest('POST', 'upload', data, (err, response, body) => {
      if (err) {
        return this.emit('uploader:upload-failed', err, file);
      }

      if (response.statusCode !== 200) {
        return this.emit('uploader:upload-failed', new Error(response.statusMessage), file);
      }

      this.emit('uploader:upload-complete', JSON.parse(body), file);
    });
  }

  delete(id) {
    // ...
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
