let AppDispatcher = require('../dispatcher/AppDispatcher');

let {
  ACTION_TYPES
} = require('../constants/MangaConstants');

module.exports = {
  receiveMangaInfo(manga, info) {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.RECEIVE_MANGA_INFO,
      manga: manga,
      info: info
    });
  }
};
