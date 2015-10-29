var React = require('react');

var HeaderComponent = React.createClass({
  render() {
    return (
      <header>
        <h1><i className='zmdi zmdi-book zmd-lg'></i> Manga Reader</h1>
      </header>
    );
  }
});

module.exports = HeaderComponent;
