let React = require('react');
let SearchResultsHeaders = require('./SearchResultsHeaders.react');
let EmptySearchResult = require('./EmptySearchResult.react');
let SearchInfo = require('./SearchInfo.react');
let SearchResultsRow = require('./SearchResultsRow.react');

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
      showSearchWarning
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
          <thead>
            <SearchResultsHeaders />
          </thead>
          <tbody>
            {
              results.map((result, i) =>
                <SearchResultsRow manga={result} key={i} infoExpanded={expandedRowIndex === i} handleClick={this.toggleInfoPanelVisibility(i)} />)
            }
          </tbody>
          {results.length > 50 && (
            <tfoot>
              <SearchResultsHeaders />
            </tfoot>
          )}
        </table>
      </div>
    );
  }
});

module.exports = SearchResultsTable;
