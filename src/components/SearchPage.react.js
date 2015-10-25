let React = require('react');
let LoadingIcon = require('./LoadingIcon.react');
let SearchStore = require('../stores/SearchStore');
let SearchWarning = require('./SearchWarning.react');
let SearchField = require('./SearchField.react');
let SearchResultsTable = require('./SearchResultsTable.react');

function getStateFromStores() {
  return {
    results: SearchStore.getSearchResults(),
    term: SearchStore.getLastSearchTerm(),
    waitingForSearch: SearchStore.isWaitingForSearch(),
    showSearchWarning: SearchStore.shouldShowSearchWarning()
  };
}

let SearchPage = React.createClass({
  getInitialState() {
    return getStateFromStores();
  },

  componentDidMount() {
    SearchStore.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
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
        <h2>Search mangas</h2>
        <SearchField lastSearchTerm={term} />
        <SearchWarning visible={showSearchWarning} term={term} />
        {waitingForSearch && <LoadingIcon text={`Searching for '${term}'...`} />}
        <SearchResultsTable {...this.state} />
      </div>
    );
  }
});

module.exports = SearchPage;
