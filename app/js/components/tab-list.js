module.exports = window.React.createClass({
  render() {
    return (
      <ul className='nav nav-tabs'>
        <li className='active'>
          <a href='#images' data-toggle='tab'>
            Images
          </a>
        </li>

        <li>
          <a href='#settings' data-toggle='tab'>
            Settings
          </a>
        </li>
      </ul>
    );
  }
});
