import MangaActionsCreators from '../actions/MangaActionsCreators';
import MangaStore from '../stores/MangaStore';
import {byName} from './parsers';

let MangaAPI = {
  getMangaInfo(manga) {
    let mangaInfo = MangaStore.getMangaInfo(manga.title);

    if (mangaInfo) {
      MangaActionsCreators.receiveMangaInfo(manga, mangaInfo);
      return;
    }

    let source = manga.sources[0];
    let parser = byName[source.name];

    parser.getMangaInfo(source, (info) => {
      MangaActionsCreators.receiveMangaInfo(manga, info);
    });
  }
};

module.exports = MangaAPI;
