const electron = window.require('electron');

const {
  shell
} = electron;

module.exports = window.React.createClass({
  getInitialState() {
    const images = JSON.parse(window.localStorage.getItem('images')) || [];
    return { images, uploading: false };
  },

  componentDidMount() {
    // ... ?
  },

  goto(link) {
    shell.openExternal(link);
  },

  render() {
    return (
      <div>
        <ul className='list-group'>
          {(() => {
            if (this.state.uploading) {
              return (
                <li className='list-group-item disabled'>
                  Image Uploading...
                </li>
              );
            }
          })()}
          {this.state.images.map((image) => {
            return (
              <button
                type='button'
                className='list-group-item'
                key={image.id}
                onClick={this.goto.bind(this, image.link)}
              >
                {image.link}
              </button>
            );
          })}
        </ul>
      </div>
    );
  }
});
