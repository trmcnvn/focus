const Settings = require('./settings.js');

module.exports = window.React.createClass({
  render() {
    return (
      <div className='tab-content'>
        <div className='tab-pane active' id='images'>
          <h1>Images</h1>
        </div>

        <div className='tab-pane' id='settings'>
          <Settings />
        </div>
      </div>
    );
  }
});
