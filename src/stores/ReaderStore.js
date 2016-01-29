import AppDispatcher from '../dispatcher/AppDispatcher';
import {EventEmitter} from 'events';
import {ACTION_TYPES} from '../constants/ReaderConstants';

const CHANGE_EVENT = 'change';

let _mangaWithPages = null;
let _doneLoadingManga = false;
let _loadedPagesCount = 0;

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
  },

  getLoadedPagesCount() {
    return _loadedPagesCount;
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

function pageDidLoad() {
  _loadedPagesCount += 1;
  ReaderStore.emitChange();
}

function resetLoadedPagesCount() {
  _loadedPagesCount = 0;
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

  case ACTION_TYPES.PAGE_DID_LOAD:
    pageDidLoad();
    break;

  case ACTION_TYPES.RESET_LOADED_PAGES_COUNT:
    resetLoadedPagesCount();
    break;

  default:
  }
});

export default ReaderStore;
