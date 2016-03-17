import React, { PropTypes } from 'react'
import EmptySearchResult from './EmptySearchResult'
import SearchInfo from './SearchInfo'
import SearchResultsRow from './SearchResultsRow'

function isInReadingList(readingList, mangaName) {
  return readingList.some(item => item.normalizedName === mangaName)
}

const SearchResultsTable = React.createClass({
  propTypes: {
    results: PropTypes.array,
    term: PropTypes.string,
    waitingForSearch: PropTypes.bool,
    readingList: PropTypes.array
  },

  getInitialState() {
    return {
      expandedRowIndex: null
    }
  },

  toggleInfoPanelVisibility(index) {
    return () => {
      this.setState({
        expandedRowIndex: this.state.expandedRowIndex === index ? null : index
      })
    }
  },

  render() {
    let {
      results,
      term,
      waitingForSearch,
      readingList
    } = this.props

    let { expandedRowIndex } = this.state

    if (!results.length) {
      if (term && !waitingForSearch) {
        return <EmptySearchResult term={ term } />
      }

      return null
    }

    return (
      <div className='search-results'>
        <SearchInfo resultsLength={ results.length } term={ term } />
        <table className='search-results-table'>
          <tbody>
            {
              results.map((result, i) =>
                <SearchResultsRow
                  key={ i }
                  infoExpanded={ expandedRowIndex === i }
                  manga={ result }
                  isInReadingList={ isInReadingList(readingList, result.normalizedName) }
                  handleClick={ this.toggleInfoPanelVisibility(i) } />)
            }
          </tbody>
        </table>
      </div>
    )
  }
})

export default SearchResultsTable
