let AppDispatcher = require('../dispatcher/AppDispatcher');
let EventEmitter = require('events').EventEmitter;
const CHANGE_EVENT = 'change';
let {
  ACTION_TYPES
} = require('../constants/MangaConstants');

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
  switch(action.type) {
  case ACTION_TYPES.RECEIVE_MANGA_INFO:
    receiveMangaInfo(action.manga, action.info);
    break;

  default:
  }
});

module.exports = MangaStore;
