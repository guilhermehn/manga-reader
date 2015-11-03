let AppDispatcher = require('../dispatcher/AppDispatcher');
let EventEmitter = require('events').EventEmitter;
const CHANGE_EVENT = 'change';
let {
  ACTION_TYPES
} = require('../constants/ReadingListConstants');

let _readingList = [];

let ReadingListStore = Object.assign({}, EventEmitter.prototype, {
  emitChange() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  getReadingList() {
    return _readingList;
  }
});

function receiveReadingList(readingList) {
  _readingList = readingList;
  ReadingListStore.emitChange();
}

ReadingListStore.dispatchToken = AppDispatcher.register((action) => {
  switch(action.type) {
  case ACTION_TYPES.LOAD_READING_LIST:
    receiveReadingList(action.readingList);
    break;

  default:
  }
});

module.exports = ReadingListStore;
