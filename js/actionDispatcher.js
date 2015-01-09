var ACTIONS = {};

function formatMgName (name) {
  if (name === undefined || name === null || name === 'null') {
    return '';
  }

  return name.trim().replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}

function getSimilarMangaTitles (mg) {
  var res = [];
  var titMg = formatMgName(mg.name);
  for (var i = 0; i < MANGA_LIST.length; i++) {
    if (formatMgName(MANGA_LIST[i].name) === titMg) {
      res[res.length] = MANGA_LIST[i];
    }
  }
  return res;
}

ACTIONS.readManga = function readManga (request, callback, doSave) {
  var mangaExist = isInMangaList(request.url);
  if (mangaExist === null) {
    var newManga = new MangaElt(request);
    var simMgs = getSimilarMangaTitles(newManga);
    if (simMgs.length > 0) {
      for (var i = 0; i < simMgs.length; i++) {
        if (simMgs[i].read === 1) {
          newManga.read = 1;
          break;
        }
        if (simMgs[i].update === 0) {
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
    var ancLstChap = mangaExist.lastChapterReadURL;
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
};

function actionDipatcher (message, sender, sendResponse) {

}
