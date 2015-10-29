let React = require('react'); // eslint-disable-line
let Menu = require('./Menu.react');
let Header = require('./Header.react');
let {menuItems} = require('../constants/MenuConstants');

let ControlPanel = React.createClass({
  render() {
    return (
      <div>
        <Header />
        <Menu items={menuItems} />
        {this.props.children}
      </div>
    );
  }
});

module.exports = ControlPanel;
