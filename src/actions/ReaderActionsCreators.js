let AppDispatcher = require('../dispatcher/AppDispatcher');

let {
  ACTION_TYPES
} = require('../constants/ReaderConstants');

module.exports = {
  selectMangaToRead(manga) {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.SELECTED_MANGA_TO_READ,
      manga: manga
    });
  }
};
