const Images = require('./images.js');
const Settings = require('./settings.js');

module.exports = window.React.createClass({
  render() {
    return (
      <div className='tab-content'>
        <div className='tab-pane active' id='images'>
          <Images />
        </div>

        <div className='tab-pane' id='settings'>
          <Settings />
        </div>
      </div>
    );
  }
});
