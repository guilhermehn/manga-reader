let AppDispatcher = require('../dispatcher/AppDispatcher');
let EventEmitter = require('events').EventEmitter;
const CHANGE_EVENT = 'change';
let {
  ACTION_TYPES
} = require('../constants/SearchConstants');

let _searchHistory = [];
let _term;
let _waitingForSearch = false;
let _results = [];

let SearchStore = Object.assign({}, EventEmitter.prototype, {
  emitChange() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  didSentSearch(term) {
    _waitingForSearch = true;
    _term = term;
    this.emitChange();
  },

  receiveSearchResults(results) {
    _results = results;
    _waitingForSearch = false;
    this.emitChange();
  },

  isWaitingForSearch() {
    return _waitingForSearch;
  },

  getLastSearchTerm() {
    return _term;
  },

  getSearchResults() {
    return _results;
  }
});

SearchStore.dispatchToken = AppDispatcher.register((action) => {
  switch(action.type) {
  case ACTION_TYPES.RECEIVE_SEARCH_RESULTS:
    SearchStore.receiveSearchResults(action.results);
    break;

  case ACTION_TYPES.DID_SENT_SEARCH:
    SearchStore.didSentSearch(action.term);
    break;

  default:
  }
});

module.exports = SearchStore;
