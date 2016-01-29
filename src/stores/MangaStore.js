import AppDispatcher from '../dispatcher/AppDispatcher';
import {EventEmitter} from 'events';
import {ACTION_TYPES} from '../constants/MangaConstants';
const CHANGE_EVENT = 'change';

let _mangaInfo = {};

let MangaStore = Object.assign({}, EventEmitter.prototype, {
  emitChange() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  getMangaInfo(title) {
    return _mangaInfo[title];
  }
});

function receiveMangaInfo(manga, info) {
  _mangaInfo[manga.title] = info;
  MangaStore.emitChange();
}

MangaStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {
  case ACTION_TYPES.RECEIVE_MANGA_INFO: {
    receiveMangaInfo(action.manga, action.info);
    break;
  }
  }
});

export default MangaStore;
