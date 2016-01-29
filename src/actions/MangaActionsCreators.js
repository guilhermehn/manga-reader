import AppDispatcher from '../dispatcher/AppDispatcher';
import {ACTION_TYPES} from '../constants/MangaConstants';

export default {
  receiveMangaInfo(manga, info) {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.RECEIVE_MANGA_INFO,
      manga: manga,
      info: info
    });
  }
};
