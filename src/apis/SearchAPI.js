let SearchActionsCreators = require('../actions/SearchActionsCreators');
let parsers = require('./parsers');

let SearchAPI = {
  search(term) {
    SearchActionsCreators.didSentSearch(term);

    parsers.search(term, (results) => {
      SearchActionsCreators.receiveSearchResults(results);
    });
  },

  addSearchTermToHistory(term) {
    SearchActionsCreators.addSearchTermToHistory(term);
  },

  showSearchWarning() {
    SearchActionsCreators.showSearchWarning();
  },

  hideSearchWarning() {
    SearchActionsCreators.hideSearchWarning();
  }
};

module.exports = SearchAPI;
