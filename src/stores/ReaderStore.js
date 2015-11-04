let AppDispatcher = require('../dispatcher/AppDispatcher');
let EventEmitter = require('events').EventEmitter;
const CHANGE_EVENT = 'change';
let {
  ACTION_TYPES
} = require('../constants/ReaderConstants');

let _mangaWithPages = null;
let _doneLoadingManga = false;

let ReaderStore = Object.assign({}, EventEmitter.prototype, {
  emitChange() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  doneLoadingManga() {
    return _doneLoadingManga;
  },

  getManga() {
    return _mangaWithPages;
  }
});

function receiveMangaWithPages(manga) {
  _mangaWithPages = manga;
  _doneLoadingManga = true;
  ReaderStore.emitChange();
}

function startedLoadingManga() {
  _doneLoadingManga = false;
  ReaderStore.emitChange();
}

ReaderStore.dispatchToken = AppDispatcher.register((action) => {
  switch(action.type) {
  case ACTION_TYPES.RECEIVE_MANGA_WITH_PAGES:
    receiveMangaWithPages(action.manga);
    break;

  case ACTION_TYPES.STARTED_LOADING_MANGA:
    startedLoadingManga();
    break;

  default:
  }
});

module.exports = ReaderStore;
