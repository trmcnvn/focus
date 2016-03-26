const TabList = require('./tab-list.js');
const TabContent = require('./tab-content.js');

module.exports = window.React.createClass({
  render() {
    return (
      <div>
        <TabList />
        <TabContent />
      </div>
    );
  }
});
