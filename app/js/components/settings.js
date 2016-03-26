const electron = window.require('electron');

const {
  ipcRenderer
} = electron;

module.exports = window.React.createClass({
  getInitialState() {
    return window.Settings;
  },

  handleChange(type, key, event) {
    const value = window.jQuery(event.target).is(':checked');
    window.Settings[type][key] = value;
    this.replaceState(window.Settings);
    ipcRenderer.send('settings:change', type, key, value);
  },

  render() {
    return (
      <div>
        <div className='panel panel-default'>
          <div className='panel-heading'>
            <h3 className='panel-title'>General Settings</h3>
          </div>
          <div className='panel-body'>
            <div className='checkbox'>
              <label>
                <input type='checkbox'
                  checked={this.state.general.clipboard}
                  onChange={this.handleChange.bind(this, 'general', 'clipboard')}
                />
                Copy links to clipboard
              </label>
            </div>
            <div className='checkbox'>
              <label>
                <input type='checkbox'
                  checked={this.state.general.launch}
                  onChange={this.handleChange.bind(this, 'general', 'launch')}
                />
                Auto-start at launch
              </label>
            </div>
          </div>
        </div>

        <div className='panel panel-default'>
          <div className='panel-heading'>
            <h3 className='panel-title'>Image Settings</h3>
          </div>
          <div className='panel-body'>
            <div className='checkbox'>
              <label>
                <input type='checkbox'
                  disabled={this.state.images.copy}
                  checked={this.state.images.delete}
                  onChange={this.handleChange.bind(this, 'images', 'delete')}
                />
                Delete after successful upload
              </label>
            </div>
            <div className='checkbox'>
              <label>
                <input type='checkbox'
                  disabled={this.state.images.delete}
                  checked={this.state.images.copy}
                  onChange={this.handleChange.bind(this, 'images', 'copy')}
                />
                Copy to <code>Pictures/Focus</code> directory
              </label>
            </div>
          </div>
        </div>

        <div className='panel panel-default'>
          <div className='panel-heading'>
            <h3 className='panel-title'>Notification Settings</h3>
          </div>
          <div className='panel-body'>
            <div className='checkbox'>
              <label>
                <input type='checkbox'
                  checked={this.state.notifications.general}
                  onChange={this.handleChange.bind(this, 'notifications', 'general')}
                />
                Enable general notifications
              </label>
            </div>
            <div className='checkbox'>
              <label>
                <input type='checkbox'
                  checked={this.state.notifications.audio}
                  onChange={this.handleChange.bind(this, 'notifications', 'audio')}
                />
                Enable audio notifications
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
