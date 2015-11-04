let SearchActionsCreators = require('../actions/SearchActionsCreators');
let ParsersAPI = require('./ParsersAPI');

let SearchAPI = {
  search(term) {
    SearchActionsCreators.didSentSearch(term);

    ParsersAPI.search(term, (results) => {
      SearchActionsCreators.receiveSearchResults(results);
    });
  },

  addSearchTermToHistory(term, dontEmit) {
    SearchActionsCreators.addSearchTermToHistory(term, dontEmit);
  },

  showSearchWarning() {
    SearchActionsCreators.showSearchWarning();
  },

  hideSearchWarning() {
    SearchActionsCreators.hideSearchWarning();
  }
};

module.exports = SearchAPI;
