import React from 'react'
import LoadingIcon from './LoadingIcon'
import SearchStore from '../stores/SearchStore'
import SearchWarning from './SearchWarning'
import SearchField from './SearchField'
import SearchResultsTable from './SearchResultsTable'
import ReadingListAPI from '../apis/ReadingListAPI'
import ReadingListStore from '../stores/ReadingListStore'

function getStateFromStores() {
  return {
    results: SearchStore.getSearchResults(),
    term: SearchStore.getLastSearchTerm(),
    waitingForSearch: SearchStore.isWaitingForSearch(),
    showSearchWarning: SearchStore.shouldShowSearchWarning(),
    readingList: ReadingListStore.getReadingList()
  }
}

const SearchPage = React.createClass({
  getInitialState() {
    return getStateFromStores()
  },

  componentDidMount() {
    ReadingListAPI.loadReadingList()
    ReadingListStore.addChangeListener(this._onChange)
    SearchStore.addChangeListener(this._onChange)
  },

  componentWillUnmount() {
    ReadingListStore.removeChangeListener(this._onChange)
    SearchStore.removeChangeListener(this._onChange)
  },

  _onChange() {
    this.setState(getStateFromStores())
  },

  render() {
    let {
      term,
      waitingForSearch,
      showSearchWarning
    } = this.state

    return (
      <div>
        <SearchField lastSearchTerm={ term } />
        { showSearchWarning && <SearchWarning term={ term } /> }
        { waitingForSearch && <LoadingIcon text={ `Searching for '${ term }'...` } /> }
        { !showSearchWarning && <SearchResultsTable { ...this.state } /> }
      </div>
    )
  }
})

export default SearchPage
