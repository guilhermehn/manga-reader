let MangaActionsCreators = require('../actions/MangaActionsCreators');
let MangaStore = require('../stores/MangaStore');
let parsers = require('./parsers');

let MangaAPI = {
  getMangaInfo(manga) {
    let mangaInfo = MangaStore.getMangaInfo(manga.title);

    if (mangaInfo) {
      MangaActionsCreators.receiveMangaInfo(manga, mangaInfo);
      return;
    }

    let source = manga.sources[0];
    let parser = parsers.byName[source.name];

    parser.getMangaInfo(source, (info) => {
      MangaActionsCreators.receiveMangaInfo(manga, info);
    });
  }
};

module.exports = MangaAPI;
