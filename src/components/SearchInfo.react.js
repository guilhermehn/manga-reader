let React = require('react');

let SearchInfo = React.createClass({
  render() {
    return (
      <div className='search-info'>
        {this.props.resultsLength} mangas were found for {`'${this.props.term}'`}
      </div>
    );
  }
});

module.exports = SearchInfo;