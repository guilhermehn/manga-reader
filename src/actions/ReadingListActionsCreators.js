let AppDispatcher = require('../dispatcher/AppDispatcher');

let {
  ACTION_TYPES
} = require('../constants/ReadingListConstants');

module.exports = {
  loadReadingList(readingList) {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.LOAD_READING_LIST,
      readingList: readingList
    });
  }
};
