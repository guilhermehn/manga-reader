let React = require('react');
let LoadingIcon = require('./LoadingIcon.react');
let SearchStore = require('../stores/SearchStore');
let SearchWarning = require('./SearchWarning.react');
let SearchField = require('./SearchField.react');
let SearchResultsTable = require('./SearchResultsTable.react');
let ReadingListAPI = require('../apis/ReadingListAPI');
let ReadingListStore = require('../stores/ReadingListStore');

function getStateFromStores() {
  return {
    results: SearchStore.getSearchResults(),
    term: SearchStore.getLastSearchTerm(),
    waitingForSearch: SearchStore.isWaitingForSearch(),
    showSearchWarning: SearchStore.shouldShowSearchWarning(),
    readingList: ReadingListStore.getReadingList()
  };
}

let SearchPage = React.createClass({
  getInitialState() {
    return getStateFromStores();
  },

  componentDidMount() {
    ReadingListAPI.loadReadingList();
    ReadingListStore.addChangeListener(this._onChange);
    SearchStore.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
    ReadingListStore.removeChangeListener(this._onChange);
    SearchStore.removeChangeListener(this._onChange);
  },

  _onChange() {
    this.setState(getStateFromStores());
  },

  render() {
    let {
      term,
      waitingForSearch,
      showSearchWarning
    } = this.state;

    return (
      <div>
        <SearchField lastSearchTerm={term} />
        {showSearchWarning && <SearchWarning term={term} />}
        {waitingForSearch && <LoadingIcon text={`Searching for '${term}'...`} />}
        <SearchResultsTable {...this.state} />
      </div>
    );
  }
});

module.exports = SearchPage;
