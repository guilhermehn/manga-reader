import AppDispatcher from '../dispatcher/AppDispatcher';
import {EventEmitter} from 'events';
import {ACTION_TYPES} from '../constants/SearchConstants';

const CHANGE_EVENT = 'change';

let _searchHistory = [];
let _waitingForSearch = false;
let _results = [];
let _searchWarningVisible = false;
let _selectedManga = null; // eslint-disable-line

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

  isWaitingForSearch() {
    return _waitingForSearch;
  },

  shouldShowSearchWarning() {
    return _searchWarningVisible;
  },

  getLastSearchTerm() {
    return _searchHistory[_searchHistory.length - 1];
  },

  getSearchResults() {
    return _results;
  },

  getMangaByName(normalizedName) {
    let selectedManga = _results.filter(manga => manga.normalizedName === normalizedName);

    if (!selectedManga.length) {
      return null;
    }

    return selectedManga[0];
  }
});

function receiveSearchResults(results) {
  _results = results;
  _waitingForSearch = false;
  SearchStore.emitChange();
}

function addSearchTermToHistory(term, dontEmit) {
  _searchHistory.push(term);

  if (!dontEmit) {
    SearchStore.emitChange();
  }
}

function didSentSearch(term) {
  _waitingForSearch = true;
  _searchHistory.push(term);
  SearchStore.emitChange();
}

function showSearchWarning() {
  _searchWarningVisible = true;
  SearchStore.emitChange();
}

function hideSearchWarning() {
  _searchWarningVisible = false;
  SearchStore.emitChange();
}

function selectedMangaToRead(manga) {
  _selectedManga = manga;
  SearchStore.emitChange();
}

SearchStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {
  case ACTION_TYPES.RECEIVE_SEARCH_RESULTS: {
    receiveSearchResults(action.results);
    break;
  }

  case ACTION_TYPES.DID_SENT_SEARCH: {
    didSentSearch(action.term);
    break;
  }

  case ACTION_TYPES.ADD_TERM_TO_HISTORY: {
    addSearchTermToHistory(action.term, action.dontEmit);
    break;
  }

  case ACTION_TYPES.SHOW_SEARCH_WARNING: {
    showSearchWarning();
    break;
  }

  case ACTION_TYPES.HIDE_SEARCH_WARNING: {
    hideSearchWarning();
    break;
  }

  case ACTION_TYPES.SELECTED_MANGA_TO_READ: {
    selectedMangaToRead(action.manga);
    break;
  }
  }
});

module.exports = SearchStore;
