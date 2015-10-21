let SearchActionsCreators = require('../actions/SearchActionsCreators');
let parsers = require('./parsers');

let SearchAPI = {
  search(term) {
    SearchActionsCreators.didSentSearch(term);

    parsers.search(term, (results) => {
      SearchActionsCreators.receiveSearchResults(results);
    });
  }
};

module.exports = SearchAPI;
