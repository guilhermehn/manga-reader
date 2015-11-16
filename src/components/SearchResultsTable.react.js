let React = require('react');
let EmptySearchResult = require('./EmptySearchResult.react');
let SearchInfo = require('./SearchInfo.react');
let SearchResultsRow = require('./SearchResultsRow.react');

function isInReadingList(readingList, mangaName) {
  return readingList.some(item => item.normalizedName === mangaName);
}

let SearchResultsTable = React.createClass({
  getInitialState() {
    return {
      expandedRowIndex: null
    };
  },

  toggleInfoPanelVisibility(index) {
    return () => {
      this.setState({
        expandedRowIndex: this.state.expandedRowIndex === index ? null : index
      });
    };
  },

  render() {
    let {
      results,
      term,
      waitingForSearch,
      showSearchWarning,
      readingList
    } = this.props;

    let {expandedRowIndex} = this.state;

    if (showSearchWarning) {
      return null;
    }

    if (!results.length) {
      if (term && !waitingForSearch) {
        return <EmptySearchResult term={term} />;
      }

      return null;
    }


    return (
      <div className='search-results'>
        <SearchInfo resultsLength={results.length} term={term} />
        <table className='search-results-table'>
          <tbody>
            {
              results.map((result, i) =>
                <SearchResultsRow
                  key={i}
                  infoExpanded={expandedRowIndex === i}
                  manga={result}
                  isInReadingList={isInReadingList(readingList, result.normalizedName)}
                  handleClick={this.toggleInfoPanelVisibility(i)} />)
            }
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = SearchResultsTable;
