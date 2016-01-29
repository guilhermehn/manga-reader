import React from 'react';

const SearchInfo = React.createClass({
  render() {
    return (
      <div className='search-info'>
        {this.props.resultsLength} mangas were found for {`'${this.props.term}'`}
      </div>
    );
  }
});

export default SearchInfo;
