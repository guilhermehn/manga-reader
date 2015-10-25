let React = require('react');

let SearchResultsHeaders = React.createClass({
  render() {
    return (
      <tr>
        <th className='ta-left'>Title</th>
        <th className='ta-right'>Sources</th>
      </tr>
    );
  }
});

module.exports = SearchResultsHeaders;
