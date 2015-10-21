let AppDispatcher = require('../dispatcher/AppDispatcher');

let {
  ACTION_TYPES
} = require('../constants/SearchConstants');

module.exports = {
  didSentSearch(term) {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.DID_SENT_SEARCH,
      term: term
    });
  },

  receiveSearchResults(results) {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.RECEIVE_SEARCH_RESULTS,
      results: results
    });
  }
};
