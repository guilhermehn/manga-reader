let SearchActionsCreators = require('../actions/SearchActionsCreators');
let parsers = require('./parsers');

let SearchAPI = {
  search(term) {
    SearchActionsCreators.didSentSearch(term);

    parsers.search(term, (results) => {
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
  },

  selectMangaToRead(manga) {
    SearchActionsCreators.selectMangaToRead(manga);
  }
};

module.exports = SearchAPI;
