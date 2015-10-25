let React = require('react');

let EmptySearchResult = React.createClass({
  render() {
    return (
      <strong>No manga contains the search term '{this.props.term}'</strong>
    );
  }
});

module.exports = EmptySearchResult;
