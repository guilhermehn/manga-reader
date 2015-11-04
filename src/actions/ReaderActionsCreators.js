let AppDispatcher = require('../dispatcher/AppDispatcher');

let {
  ACTION_TYPES
} = require('../constants/ReaderConstants');

module.exports = {
  startedLoadingManga() {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.STARTED_LOADING_MANGA
    });
  },

  receiveMangaWithPages(manga) {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.RECEIVE_MANGA_WITH_PAGES,
      manga: manga
    });
  }
};
