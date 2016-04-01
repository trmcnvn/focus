const electron = window.require('electron');

const {
  ipcRenderer
} = electron;

module.exports = window.React.createClass({
  getInitialState() {
    const key = window.process.platform === 'darwin' ? 'Command' : 'Ctrl';
    return { key };
  },

  exit() {
    ipcRenderer.send('app:quit');
  },

  render() {
    return (
      <div>
        <div className='panel panel-default'>
          <div className='panel-heading'>
            <h3 className='panel-title'>General Usage</h3>
          </div>
          <div className='panel-body'>
            <p>
              To take a full sized screenshot use: <br/>
            <kbd>{this.state.key} + Shift + 3</kbd>
            </p>
            <p>
              To take a selection based screenshot use: <br/>
            <kbd>{this.state.key} + Shift + 4</kbd>
            </p>
            <p>
              To take a screenshot of a specific window use: <br/>
              <kbd>{this.state.key} + Shift + 4 + Space</kbd>
            </p>
          </div>
        </div>

        <button type='button' className='btn btn-danger center-block' onClick={this.exit}>
          Quit
        </button>
      </div>
    );
  }
});
