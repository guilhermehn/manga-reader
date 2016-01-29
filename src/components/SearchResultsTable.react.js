import React from 'react';
import EmptySearchResult from './EmptySearchResult.react';
import SearchInfo from './SearchInfo.react';
import SearchResultsRow from './SearchResultsRow.react';

function isInReadingList(readingList, mangaName) {
  return readingList.some(item => item.normalizedName === mangaName);
}

const SearchResultsTable = React.createClass({
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

    let { expandedRowIndex } = this.state;

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

export default SearchResultsTable;
