const electron = window.require('electron');

const {
  shell,
  ipcRenderer
} = electron;

module.exports = window.React.createClass({
  getInitialState() {
    const images = JSON.parse(window.localStorage.getItem('images')) || [];
    return { images };
  },

  componentDidMount() {
    window.Events.on('images:updated', () => {
      const images = JSON.parse(window.localStorage.getItem('images'));
      this.replaceState({ images });
    });
  },

  goto(link) {
    shell.openExternal(link);
  },

  delete(hash) {
    const response = window.confirm("Are you sure?");
    if (response) {
      ipcRenderer.send('upload:delete', hash);
    }
  },

  render() {
    return (
      <div>
        <ul className='list-group'>
          {this.state.images.reverse().map((image) => {
            return (
              <li className='list-group-item clearfix' key={image.id}>
                {image.link}
                <div className="image-actions">
                  <button type="button" className="btn btn-primary" onClick={this.goto.bind(this, image.link)}>
                    Open
                  </button>
                  <button type="button" className="btn btn-danger" onClick={this.delete.bind(this, image.deleteHash)}>
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
});
