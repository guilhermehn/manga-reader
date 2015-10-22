/*globals MANGA_LIST, MangaElt*/

var ACTIONS = {};

function formatMangaName (name) {
  if (!name || !name.hasOwnProperty('length') || name.length === 0 || name === 'null') {
    return '';
  }

  return name.trim().replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}

function isInMangaList (url) {
  var i = -1;
  var length = MANGA_LIST.length;

  while (++i < length) {
    if (MANGA_LIST[i].url === url) {
      return MANGA_LIST[i];
    }
  }

  return null;
}

function getSimilarMangaTitles (mg) {
  var mangaName = formatMangaName(mg.name);

  return MANGA_LIST.filter(manga => formatMangaName(manga.name) === mangaName);
}

function readManga (request, callback, doSave) {
  var mangaExist = isInMangaList(request.url);
  var newManga;
  var similarMangas;
  var ancLstChap;

  if (mangaExist === null) {
    newManga = new MangaElt(request);
    similarMangas = getSimilarMangaTitles(newManga);

    if (similarMangas.length > 0) {
      for (var i = 0; i < similarMangas.length; i++) {
        if (similarMangas[i].read === 1) {
          newManga.read = 1;
          break;
        }

        if (similarMangas[i].update === 0) {
          newManga.update = 0;
          break;
        }
      }
    }

    MANGA_LIST[MANGA_LIST.length] = newManga;
    newManga.refreshLast();
    refreshUpdate();
    saveList();
  }
  else {
    ancLstChap = mangaExist.lastChapterReadURL;

    if (ancLstChap !== undefined) {
      mangaExist.consult(request);
      if (doSave) {
        saveList();
      }

      if (mangaExist.lastChapterReadURL !== ancLstChap) {
        refreshUpdate();
      }
    }
  }
  callback();
}

ACTIONS.readManga = readManga;
