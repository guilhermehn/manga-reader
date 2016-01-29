import AppDispatcher from '../dispatcher/AppDispatcher';
import {ACTION_TYPES} from '../constants/ReaderConstants';

export default {
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
