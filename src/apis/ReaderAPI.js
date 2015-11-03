let ReaderActionsCreators = require('../actions/ReaderActionsCreators');

let ReaderAPI = {
  selectMangaToRead(manga) {
    ReaderActionsCreators.selectMangaToRead(manga);
  }
};

module.exports = ReaderAPI;
