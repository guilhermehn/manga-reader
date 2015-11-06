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
  },

  pageDidLoad() {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.PAGE_DID_LOAD
    });
  },

  resetLoadedPagesCount() {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.RESET_LOADED_PAGES_COUNT
    });
  }
};
