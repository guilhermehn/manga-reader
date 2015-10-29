var React = require('react');
let Menu = require('./Menu.react');
let {menuItems} = require('../constants/MenuConstants');

var HeaderComponent = React.createClass({
  render() {
    return (
      <header className='control-panel-header'>
        <div className='control-panel-header-content'>
          <h1><i className='zmdi zmdi-book zmd-lg'></i> Manga Reader</h1>
          <Menu items={menuItems} />
        </div>
      </header>
    );
  }
});

module.exports = HeaderComponent;
