require('react');
require('../../node_modules/jquery/dist/jquery');
require('../../node_modules/bootstrap/dist/js/bootstrap');

const ReactDOM = require('react-dom');
const Index = require('./components/index');

ReactDOM.render(
  <Index />,
  document.getElementById('content')
);
