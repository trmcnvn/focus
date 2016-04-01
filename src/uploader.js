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

    this.emit('uploader-upload:started');
    this._buildRequest('POST', 'image', data, (err, response, body) => {
      if (err) {
        return this.emit('uploader-upload:error', err, file);
      }

      if (response.statusCode !== 200) {
        return this.emit('uploader-upload:error', new Error(response.statusMessage), file);
      }

      this.emit('uploader-upload:complete', JSON.parse(body), file);
    });
  }

  delete(hash) {
    this._buildRequest('DELETE', `image/${hash}`, null, (err, response) => {
      if (err) {
        return this.emit('uploader-delete:error', err, hash);
      }

      if (response.statusCode !== 200) {
        return this.emit('uploader-delete:error', new Error(response.statusMessage), hash);
      }

      this.emit('uploader-delete:complete', hash);
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
