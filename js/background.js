/*globals translate, wssql, MangaElt, BSync, getMangaMirror, getMirrors, updateWebsitesFromRepository, actionDipatcher, ACTIONS*/
var MANGA_LIST;
var mirrors;
var ctxIds = [];
var bookmarks;
var actMirrors;
var timeoutChap;
var timeoutMg;
var timeoutWs;
var updatews = 86400 * 1000;
var canvas = document.createElement('canvas');
canvas.width = '19';
canvas.height = '19';
var canvasContext = canvas.getContext('2d');
var animationFrames = 20;
var animationSpeed = 30;
var rotation = 0;
var sharinganImage = document.createElement('img');
sharinganImage.src = 'img/amrlittle.png';
var statusReady = true;
var reason;
var contentScripts = ['js/jquery.js', 'js/jquery.scrollTo-1.4.3.1-min.js', 'js/jquery.simplemodal-1.4.4.js', 'js/back.js'];

/**
 * Returns the week number for this date.  dowOffset is the day of week the week
 * 'starts' on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
 * the week returned is the ISO 8601 week number.
 * @param int dowOffset
 * @return int
 */
Date.prototype.getWeek = function (dowOffset) {
  /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

  dowOffset = typeof dowOffset === 'number' ? dowOffset : 0; // default dowOffset to zero
  var newYear = new Date(this.getFullYear(), 0, 1);
  var day = newYear.getDay() - dowOffset; // the day of week the year begins on
  day = (day >= 0 ? day : day + 7);
  var daynum = Math.floor((this.getTime() - newYear.getTime() -
    (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;

  var weeknum;

  // if the year starts before the middle of a week
  if (day < 4) {
    weeknum = Math.floor((daynum + day - 1) / 7) + 1;
    if (weeknum > 52) {
      var nYear = new Date(this.getFullYear() + 1, 0, 1);
      var nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      /*if the next year starts before the middle of
      the week, it is week #1 of that year*/
      weeknum = nday < 4 ? 1 : 53;
    }
  }
  else {
    weeknum = Math.floor((daynum + day - 1) / 7);
  }
  return weeknum;
};

function initParam (object, paramName, defaultVal) {
  if (typeof object[paramName] === 'undefined' || object[paramName] === null || object[paramName] === 'null') {
    object[paramName] = defaultVal;
  }
}

function defaultParams () {
  var obj = {
    displayAds: 1,
    displayChapters: 1,
    displayMode: 1,
    popupMode: 1,
    omSite: 0,
    newTab: 0,
    sync: 0,
    displayzero: 1,
    pub: 1,
    dev: 0,
    load: 0,
    resize: 1,
    color: 0,
    imgorder: 0,
    groupmgs: 1,
    openupdate: 0,
    updatechap: 30 * 60000,
    updatemg: 24 * 60 * 60000,
    newbar: 1,
    addauto: 1,
    lrkeys: 1,
    size: 1,
    autobm: 1,
    prefetch: 1,
    shownotifications: 1,
    notificationtimer: 0,
    rightnext: 1,
    refreshspin: 1,
    savebandwidth: 0,
    checkmgstart: 0,
    nocount: 0,
    displastup: 1,
    markwhendownload: 0,
    sendstats: 1,
    shownotifws: 1
  };

  return obj;
}

function getParameters () {
  var params = localStorage.getItem('parameters');
  var res;
  if (typeof params === 'undefined' || params === null || params === 'null') {
    res = defaultParams();
    localStorage.setItem('parameters', JSON.stringify(res));
  }
  else {
    res = JSON.parse(params);
    initParam(res, 'omSite', 0);
    initParam(res, 'newTab', 0);
    initParam(res, 'sync', 0);
    initParam(res, 'displayzero', 1);
    initParam(res, 'pub', 1);
    initParam(res, 'dev', 0);
    initParam(res, 'load', 0);
    initParam(res, 'resize', 1);
    initParam(res, 'color', 0);
    initParam(res, 'imgorder', 0);
    initParam(res, 'groupmgs', 1);
    initParam(res, 'openupdate', 0);
    initParam(res, 'updatechap', 6 * 60 * 60000);
    initParam(res, 'updatemg', 24 * 60 * 60000);
    initParam(res, 'newbar', 1);
    initParam(res, 'addauto', 1);
    initParam(res, 'lrkeys', 1);
    initParam(res, 'size', 1);
    initParam(res, 'autobm', 1);
    initParam(res, 'prefetch', 1);
    initParam(res, 'shownotifications', 1);
    initParam(res, 'notificationtimer', 0);
    initParam(res, 'rightnext', 1);
    initParam(res, 'refreshspin', 1);
    initParam(res, 'savebandwidth', 0);
    initParam(res, 'checkmgstart', 0);
    initParam(res, 'nocount', 0);
    initParam(res, 'displastup', 1);
    initParam(res, 'markwhendownload', 0);
    initParam(res, 'sendstats', 1);
    initParam(res, 'shownotifws', 1);
    localStorage.setItem('parameters', JSON.stringify(res));
  }
  return res;
}

function isInMangaList (url) {
  for (var i = 0; i < MANGA_LIST.length; i++) {
    if (MANGA_LIST[i].url === url) {
      return MANGA_LIST[i];
    }
  }
  return null;
}

function isInMangaListId (url) {
  for (var i = 0; i < MANGA_LIST.length; i++) {
    if (MANGA_LIST[i].url === url) {
      return i;
    }
  }
  return -1;
}

function isMirrorActivated (mirrorName) {
  var states = localStorage.getItem('mirrorStates');
  var lstTmp = JSON.parse(states);

  if (lstTmp.length > 0) {
    for (var j = 0; j < lstTmp.length; j++) {
      if (lstTmp[j].mirror === mirrorName) {
        return lstTmp[j].activated;
      }
    }
  }

  return false;
}

function mangaListLoaded (mirror, lst) {
  console.log('mirror manga list loaded for ' + mirror + ' list size : ' + lst.length);
  wssql.webdb.empty(mirror, function () {
    wssql.webdb.storeMangaList(mirror, lst);
  });
}

function activateMirror (mirrorName) {
  var states = localStorage.getItem('mirrorStates');
  var lstTmp = JSON.parse(states);

  if (lstTmp.length > 0) {
    for (var j = 0; j < lstTmp.length; j++) {
      if (lstTmp[j].mirror === mirrorName) {
        lstTmp[j] = {
          mirror : mirrorName,
          activated : true
        };

        localStorage.setItem('mirrorStates', JSON.stringify(lstTmp));

        try {
          for (var i = 0; i < mirrors.length; i++) {
            if (mirrors[i].mirrorName === mirrorName) {
              actMirrors[actMirrors.length] = mirrors[i];
              if (mirrors[i].canListFullMangas) {
                mirrors[i].getMangaList('', mangaListLoaded);
              }
            }
          }
        }
        catch (e) {
          console.error('Error while activating a mirror:', e.getStack());
        }

        break;
      }
    }
  }
}

function getJsonFromElement (element) {
  var obj = {
    mirror: element.mirror,
    name: element.name,
    url: element.url,
    lastChapterReadURL: element.lastChapterReadURL,
    lastChapterReadName: element.lastChapterReadName,
    read: element.read,
    update: element.update,
    display: element.display,
    ts: element.ts,
    upts: element.upts,
    listChaps: JSON.stringify(element.listChaps),
    cats: JSON.stringify(element.cats)
  };

  return JSON.stringify(obj);
}

function getJSONList () {
  var results = [];

  MANGA_LIST.forEach(function (object) {
    var value = getJsonFromElement(object);

    if (typeof value !== 'undefined') {
      results.push(value);
    }
  });

  return '[' + results.join(', ') + ']';
}

function grayscale (cnv, w, h) {
  var imageData = cnv.getImageData(0, 0, w, h);

  for (var j = 0; j < imageData.height; j++) {
    for (var i = 0; i < imageData.width; i++) {
      var index = (i * 4) * imageData.width + (j * 4);
      var average = (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3 + 75;
      if (average > 255) {
        average = 255;
      }

      imageData.data[index] = average;
      imageData.data[index + 1] = average;
      imageData.data[index + 2] = average;
    }
  }

  cnv.putImageData(imageData, 0, 0, 0, 0, imageData.width, imageData.height);
}

function drawIcon (isgrey) {
  var width = canvas.width;
  var height = canvas.height;
  var halfWidth = width / 2;
  var halfHeight = height / 2;

  canvasContext.save();
  canvasContext.clearRect(0, 0, width, height);
  canvasContext.translate(halfWidth, halfHeight);
  canvasContext.drawImage(sharinganImage, -halfWidth, -halfHeight);

  if (isgrey) {
    grayscale(canvasContext, width, height);
  }

  canvasContext.restore();

  chrome.browserAction.setIcon({
    imageData : canvasContext.getImageData(0, 0, width, height)
  });
}

function refreshTag () {
  var nbNews = 0;
  var listDone = [];
  for (var i = 0; i < MANGA_LIST.length; i++) {
    if (MANGA_LIST[i].listChaps.length > 0) {
      var shortName = formatMgName(MANGA_LIST[i].name);
      var found = false;
      for (var j = 0; j < listDone.length; j++) {
        if (listDone[j] === shortName) {
          found = true;
          break;
        }
      }
      if (!found || getParameters().groupmgs === 0) {
        var lastName = MANGA_LIST[i].listChaps[0][1];
        if (lastName !== MANGA_LIST[i].lastChapterReadURL && MANGA_LIST[i].read === 0) {
          listDone[listDone.length] = shortName;
          nbNews++;
        }
      }
    }
  }
  var params = getParameters();
  if (nbNews === 0) {
    if (params.nocount === 1) {
      drawIcon(true);
      chrome.browserAction.setBadgeText({
        text : ''
      });
    }
    else {
      if (params.displayzero === 1) {
        chrome.browserAction.setBadgeText({
          text : '0'
        });
      }
      else {
        chrome.browserAction.setBadgeText({
          text : ''
        });
      }
      chrome.browserAction.setBadgeBackgroundColor({
        color : [127, 127, 127, 255]
      });
    }
  }
  else {
    if (params.nocount === 1) {
      drawIcon(false);
      chrome.browserAction.setBadgeText({
        text : ''
      });
    }
    else {
      chrome.browserAction.setBadgeText({
        text : nbNews.toString()
      });
      chrome.browserAction.setBadgeBackgroundColor({
        color : [255, 0, 0, 255]
      });
    }
  }
}

function saveList () {
  try {
    localStorage.setItem('mangas', getJSONList());
    refreshTag();
  }
  catch (e) {
    console.error('Error while saving the manga list:', e.getStack());
  }
}

function refreshUpdateWith (update) {
  try {
    var params = getParameters();
    params.updated = update;

    localStorage.setItem('parameters', JSON.stringify(params));
  }
  catch (e) {
    console.error('Error while refreshing with update:', update, '\n', e.getStack());
  }
}

function refreshSync () {
  try {
    var params = getParameters();
    params.lastsync = new Date().getTime();
    localStorage.setItem('parameters', JSON.stringify(params));
  }
  catch (e) {
    console.error('Error while refreshing the sync date:', e.getStack());
  }
}

function jsonmangaelttosync (mangaelt) {
  var obj = {
    mirror: mangaelt.mirror,
    name: mangaelt.name,
    url: mangaelt.url,
    lastChapterReadURL: mangaelt.lastChapterReadURL,
    lastChapterReadName: mangaelt.lastChapterReadName,
    read: mangaelt.read,
    update: mangaelt.update,
    ts: mangaelt.ts,
    display: mangaelt.display,
    cats: JSON.stringify(mangaelt.cats)
  };

  return JSON.stringify(obj);
}

function getJSONListToSync () {
  var results = MANGA_LIST
    .map(jsonmangaelttosync)
    .filter(json => typeof json !== 'undefined');

  return '[' + results.join(', ') + ']';
}

// Here we shouldn't be using this...
var sync = new BSync({
  getUpdate : function () {
    return getParameters().updated;
  },

  onRead : function (json) {
    debugger;
    console.log('Reading incoming synchronisation');

    if (!(typeof json === 'undefined' || json === null || json === 'null')) {
      console.log(' - Updating incoming entries');

      var lstTmp = JSON.parse(json.mangas);
      var i;
      var tmpManga;

      for (i = 0; i < lstTmp.length; i++) {
        tmpManga = new MangaElt(lstTmp[i]);

        console.log('\t - Reading manga entry : ' + tmpManga.name + ' in mirror : ' + tmpManga.mirror);

        var mangaExist = isInMangaList(tmpManga.url);

        if (mangaExist === null) {
          console.log('\t  --> Manga not found in current list, adding manga... ');

          if (!isMirrorActivated(tmpManga.mirror)) {
            activateMirror(tmpManga.mirror);
          }

          MANGA_LIST.push(tmpManga);
          MANGA_LIST[MANGA_LIST.length].refreshLast();
        }
        else {
          // Verify chapter last
          console.log('\t  --> Manga found in current list, verify last chapter read. incoming : ' + tmpManga.lastChapterReadURL + '; current : ' + mangaExist.lastChapterReadURL);
          mangaExist.consult(tmpManga);
          saveList();
        }
      }

      console.warning(' - Deleting mangas not in incoming list');

      MANGA_LIST = MANGA_LIST.filter(function (mangaEntry) {
        var found = lstTmp.some(function (manga) {
          var mangaElement = new MangaElt(manga);

          return mangaEntry.url === mangaElement.url;
        });

        if (!found) {
          console.warning('\t - Deleting manga entry in current list : ' + mangaEntry.name + ' in mirror : ' + mangaEntry.mirror);
          return false;
        }

        return true;
      });
    }

    saveList();
    refreshUpdateWith(this.syncedAt);
    refreshSync();
  },

  onWrite : function () {
    console.log('Writing current configuration to synchronise');
    var params = getParameters();

    this.write({
      mangas : getJSONListToSync(),
      updated : params.updated
    });

    refreshSync();
  }
});

function sendSearch (selectedText) {
  var serviceCall = chrome.extension.getURL('search.html') + '?s=' + selectedText;

  chrome.tabs.create({
    url : serviceCall
  });
}

chrome.contextMenus.create({
  title : 'Search %s on AllMangasReader',
  contexts : ['selection'],
  onclick : function (info) {
    sendSearch(info.selectionText);
  }
});

function isReady (statusReadyT, reasonT) {
  if (statusReadyT === false) {
    chrome.browserAction.setIcon({
      path: 'img/blue-sharingan.png'
    });

    statusReady = statusReadyT;

    if (typeof reason !== 'undefined') {
      reason = reasonT;
    }

    return;
  }

  if (statusReadyT && !statusReady) {
    chrome.browserAction.setIcon({
      path: 'img/amrlittle.png'
    });

    statusReady = statusReadyT;
    reason = null;

    return;
  }

  if (typeof statusReadyT === 'undefined' && typeof reasonT === 'undefined') {
    return {
      statusReady: statusReady,
      reason: reason
    };
  }
}

function replaceInUrls (url, find, rep) {
  var res = url;

  if (typeof url !== 'undefined' && url !== null && url.indexOf(find) !== -1) {
    res = url.replace(find, rep);
  }

  return res;
}

function instantiateMirrors () {
  var mirrorsStates = mirrors.map(function (mirror) {
    return {
      mirror: mirror.mirrorName,
      activated: true
    };
  });

  localStorage.setItem('mirrorStates', JSON.stringify(mirrorsStates));
}

function initMirrorState () {
  var statesJson = localStorage.getItem('mirrorStates');

  if (typeof statesJson === 'undefined' || statesJson === null || statesJson === 'null') {
    instantiateMirrors();
  }
  else {
    var states = JSON.parse(statesJson);

    if (states.length > 0) {
      var toUpdate = false;

      mirrors.forEach(function (mirror) {
        var isFound = states.some(state => state.mirror === mirror.mirrorName);

        if (!isFound) {
          states.push({
            mirror : mirror.mirrorName,
            activated : true
          });

          toUpdate = true;
        }
      });

      if (toUpdate) {
        localStorage.setItem('mirrorStates', JSON.stringify(states));
      }
    }
    else {
      instantiateMirrors();
    }
  }
}

function WaitForAllLists (sizeAll, onFinish, doSpin) {
  this.nbMade = 0;
  this.sizeAll = sizeAll;
  this.onFinish = onFinish;
  this.doSpin = doSpin;
  this.started = false;
  this.doEase = true;
}

function refreshManga (mg, waiter, pos) {
  var mirror = getMangaMirror(mg.mirror);

  if (mirror === null) {
    return;
  }

  if (getParameters().savebandwidth === 1 || (typeof mirror.savebandwidth !== 'undefined' && mirror.savebandwidth)) {
    if (waiter.nbMade === pos) {
      mg.refreshLast(false, waiter.incMade.bind(waiter));
    }
    else {
      setTimeout(refreshManga.bind(null, mg, waiter, pos), 100);
    }
  }
  else {
    mg.refreshLast(false, waiter.incMade.bind(waiter));
  }
}

function refreshAllLasts (refreshTimer, perform) {
  var params = getParameters();

  try {
    var i;

    if (typeof perform === 'undefined' || perform === true) {
      console.log('Refreshing chapters at ' + new Date());

      localStorage.setItem('lastChaptersUpdate', new Date().getTime());

      var pos = 0;
      var mirror;
      var mangasToRefreshCount = MANGA_LIST.filter(manga => getMangaMirror(manga.mirror) !== null).length;
      var waiter = new WaitForAllLists(mangasToRefreshCount, saveList, params.refreshspin);

      for (i = 0; i < MANGA_LIST.length; i++) {
        mirror = getMangaMirror(MANGA_LIST[i].mirror);

        if (mirror !== null && mirror.hasOwnProperty('savebandwidth') || !mirror.savebandwidth) {
          refreshManga(MANGA_LIST[i], waiter, pos);
          pos++;
        }
      }

      for (i = 0; i < MANGA_LIST.length; i++) {
        mirror = getMangaMirror(MANGA_LIST[i].mirror);

        if (mirror !== null && mirror.hasOwnProperty('savebandwidth') && mirror.savebandwidth) {
          refreshManga(MANGA_LIST[i], waiter, pos);
          pos++;
        }
      }

      waiter.wait();
    }
  }
  catch (e) {
    console.error('Error while refreshing chapters:', e.getStack());
  }

  var nextTime = params.updatechap;

  if (refreshTimer) {
    clearTimeout(timeoutChap);
    nextTime =  -(new Date().getTime() - localStorage.getItem('lastChaptersUpdate') - nextTime);
  }

  console.info('Time until next chapters list update:', nextTime / 1000, 'seconds');
  timeoutChap = setTimeout(refreshAllLasts, nextTime);
}

function refreshMangaLists (refreshTimer, perform) {
  try {
    if (typeof perform === 'undefined' || perform === true) {
      var now = new Date();

      console.info('Refreshing mangas lists at', now);

      localStorage.setItem('lastMangasUpdate', now.getTime());

      mirrors.forEach(function (mirror) {
        if (mirror.canListFullMangas && isMirrorActivated(mirror.mirrorName)) {
          mirror.getMangaList('', mangaListLoaded);
        }
      });
    }
  }
  catch (e) {
    console.error('Error while refreshing mangas list:', e.getStack());
  }

  var nextTime = getParameters().updatemg;

  if (refreshTimer) {
    clearTimeout(timeoutMg);
    nextTime = -(new Date().getTime() - (+localStorage.getItem('lastMangasUpdate')) - nextTime);
  }

  console.log('Next time to refresh manga list : ' + nextTime);

  timeoutMg = setTimeout(refreshMangaLists, nextTime);
}

function refreshNewMirrorsMangaLists () {
  mirrors.forEach(function (mirror) {
    if (mirror.canListFullMangas && isMirrorActivated(mirror.mirrorName)) {
      wssql.webdb.getMangaList(mirror.mirrorName, function (list, mirror) {
        if (!list || list === null || list.length === 0) {
          console.info('New website added:', mirror, '- getting it\'s mangas list.');
          getMangaMirror(mirror).getMangaList('', mangaListLoaded);
        }
      });
    }
  });
}

function updateMirrors (callback) {
  getMirrors(function (mirrorsT) {
    mirrors = mirrorsT;
    initMirrorState();
    actMirrors = mirrors.filter(mirror => isMirrorActivated(mirror.mirrorName));

    refreshNewMirrorsMangaLists();
    callback();
  });
}

function refreshWebsites (refreshTimer, perform) {
  var now = new Date();

  try {
    if (typeof perform === 'undefined' || perform === true) {
      console.log('Refreshing websites implementations at ' + now);

      localStorage.setItem('lastWsUpdate', now.getTime());

      updateWebsitesFromRepository(function () {
        updateMirrors(function () {});
      });
    }
  }
  catch (e) {
    console.error('Error updating the websites scripts:', e.getStack());
  }

  var nextTime = updatews;

  if (refreshTimer) {
    clearTimeout(timeoutWs);
    nextTime =  - (now.getTime() - localStorage.getItem('lastWsUpdate') - nextTime);
  }

  console.log('Next time to refresh websites implementations : ' + nextTime);

  timeoutWs = setTimeout(refreshWebsites, nextTime);
}

function formatMgName (name) {
  if (typeof name === 'undefined' || name === null || name === 'null') {
    return '';
  }

  return name.trim().replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}

function refreshUpdate () {
  try {
    var params = getParameters();
    params.updated = new Date().getTime();
    params.changesSinceSync = 1;
    localStorage.setItem('parameters', JSON.stringify(params));
  }
  catch (e) {
    console.log(e);
  }
}

function getStoredBookmarks () {
  var json = localStorage.getItem('bookmarks');
  var bookmarks;

  if (json === null) {
    return [];
  }

  try {
    bookmarks = JSON.parse(json);
  }
  catch (e) {
    console.error('Error getting the bookmarks:', e.getStack());
    bookmarks = [];
  }
  finally {
    return bookmarks;
  }
}

function isBetaVersion () {
  if (typeof chrome.extension.beta_ === 'undefined') {
    initManifestVars();
  }

  return chrome.extension.beta_;
}

function setWindowTitle (curVersion) {
  var title = 'All Mangas Reader';

  if (isBetaVersion()) {
    title += ' Beta Channel';
  }

  chrome.browserAction.setTitle({
    title : [title, curVersion].join(' ')
  });
}

function openNewVersionPage () {
  var url = isBetaVersion() ? 'https://github.com/AllMangasReader-dev/AMR/commits/develop' : 'http://wiki.allmangasreader.com/changelog';

  chrome.tabs.create({
    url : url
  });
}

function updateStoredVersion (version) {
  localStorage.setItem('version', version);
}

function extensionHasBeenUpdated (currentVersion) {
  var prevVersion = localStorage.getItem('version');

  if (typeof prevVersion === 'undefined' || prevVersion === null || prevVersion === 'null') {
    return false;
  }

  return currentVersion !== prevVersion;
}

function getStoredMangasList () {
  var list = localStorage.getItem('mangas');
  var mangas;

  if (typeof list === 'undefined' || list === null || list === 'null') {
    return [];
  }

  mangas = JSON.parse(list);

  return mangas.map(function (manga) {
    manga.url = replaceInUrls(manga.url, 'submanga.me', 'submanga.com');
    manga.lastChapterReadURL = replaceInUrls(manga.lastChapterReadURL, 'submanga.me', 'submanga.com');

    manga.url = replaceInUrls(manga.url, 'www.mangafox.com', 'mangafox.me');
    manga.lastChapterReadURL = replaceInUrls(manga.lastChapterReadURL, 'www.mangafox.com', 'mangafox.me');

    return new MangaElt(manga);
  });
}

function getActiveMirrors (mirrors) {
  return mirrors.filter(function (mirror) {
    return isMirrorActivated(mirror.mirrorName);
  });
}

function scheduleNextUpdate (lastUpdate, interval, fn) {
  var now = new Date();
  var remainingTime = now.getTime() - lastUpdate - interval;

  if (remainingTime > 0) {
    fn();
  }
  else {
    return setTimeout(fn, -remainingTime);
  }
}

/* Initialise the list of followed mangas */
function init () {
  getMirrors(function (mirrorsT) {
    var doDeleteMirs = false;
    var params = getParameters();
    var currentVersion = getExtensionVersion();
    var hasBeenUpdated = extensionHasBeenUpdated(currentVersion);

    mirrors = mirrorsT;

    mirrors.forEach(function (mirror) {
      var mirrorName = mirror.mirrorName;

      if (localStorage.getItem(mirrorName)) {
        doDeleteMirs = true;
        localStorage.removeItem(mirrorName);
      }
    });

    if (doDeleteMirs) {
      localStorage.removeItem('lastMangasUpdate');
    }

    initMirrorState();

    // get active mirrors
    actMirrors = getActiveMirrors(mirrors);

    // get mangas list
    MANGA_LIST = getStoredMangasList();

    // get user stored bookmarks
    bookmarks = getStoredBookmarks();

    if (hasBeenUpdated) {
      // store the new version
      updateStoredVersion(currentVersion);

      // open the changelog page
      openNewVersionPage();
    }

    // update window title
    setWindowTitle(currentVersion);

    saveList();

    if (params.sync === 1) {
      console.info('Synchronization started');
      sync.start();
    }

    var lastChaptersUpdate = localStorage.getItem('lastChaptersUpdate');
    var lastMangasUpdate = localStorage.getItem('lastMangasUpdate');
    var lastWsUpdate = localStorage.getItem('lastWsUpdate');

    if (!lastChaptersUpdate || params.checkmgstart === 1) {
      refreshAllLasts();
    }
    else {
      timeoutChap = scheduleNextUpdate(lastChaptersUpdate, params.updatechap, refreshAllLasts);
    }

    if (!lastMangasUpdate) {
      refreshMangaLists();
    }
    else {
      timeoutMg = scheduleNextUpdate(lastChaptersUpdate, params.updatemg, refreshMangaLists);
      refreshNewMirrorsMangaLists();
    }

    if (!lastWsUpdate) {
      refreshWebsites();
    }
    else {
      timeoutWs = scheduleNextUpdate(lastChaptersUpdate, updatews, refreshWebsites);
    }
  });
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

function readManga (request, callback, doSave) {
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
}

function killManga (request, callback, doSave) {
  var mangaExist = isInMangaListId(request.url);
  if (mangaExist !== -1) {
    // var mirName = MANGA_LIST[mangaExist].mirror;
    // var mgName = MANGA_LIST[mangaExist].name;
    MANGA_LIST.remove(mangaExist, mangaExist);
    if (doSave) {
      saveList();
      refreshUpdate();
    }
  }
  callback();
}

function resetManga (request, callback, doSave) {
  var mangaExist = isInMangaList(request.url);
  if (mangaExist !== null) {
    if (mangaExist.listChaps.length > 0) {
      mangaExist.lastChapterReadURL = mangaExist.listChaps[mangaExist.listChaps.length - 1][1];
      mangaExist.lastChapterReadName = mangaExist.listChaps[mangaExist.listChaps.length - 1][0];
      if (doSave) {
        saveList();
        refreshUpdate();
      }
    }
  }
  callback();
}

function markReadTop (request, callback, doSave) {
  var mangaExist = isInMangaList(request.url);
  if (mangaExist !== null) {
    mangaExist.read = request.read;
    if (doSave) {
      saveList();
      refreshUpdate();
    }
  }
  callback();
}

function markUpdateTop (request, callback, doSave) {
  var mangaExist = isInMangaList(request.url);
  if (mangaExist !== null) {
    mangaExist.update = request.update;
    if (doSave) {
      saveList();
      refreshUpdate();
    }
  }
  callback();
}

function addCategory (request, callback, doSave) {
  var mangaExist = isInMangaList(request.url);
  if (mangaExist !== null) {
    var isFound = false;
    if (mangaExist.cats.length > 0) {
      for (var i = 0; i < mangaExist.cats.length; i++) {
        if (mangaExist.cats[i] === request.cat) {
          isFound = true;
          break;
        }
      }
    }
    if (!isFound) {
      mangaExist.cats[mangaExist.cats.length] = request.cat;
    }
    if (doSave) {
      saveList();
      refreshUpdate();
    }
  }
  callback();
}

function removeCatManga (request, callback, doSave) {
  var mangaExist = isInMangaList(request.url);
  if (mangaExist !== null) {
    var isFound = -1;
    if (mangaExist.cats.length > 0) {
      for (var i = 0; i < mangaExist.cats.length; i++) {
        if (mangaExist.cats[i] === request.cat) {
          isFound = i;
          break;
        }
      }
    }
    if (isFound !== -1) {
      mangaExist.cats.remove(isFound, isFound);
    }
    if (doSave) {
      saveList();
      refreshUpdate();
    }
  }
  callback();
}

function removeCategory (request, callback) {
  if (MANGA_LIST.length > 0) {
    var j;
    for (var i = 0; i < MANGA_LIST.length; i++) {
      if (MANGA_LIST[i].cats.length > 0) {
        var toRem = [];
        for (j = 0; j < MANGA_LIST[i].cats.length; j++) {
          if (MANGA_LIST[i].cats[j] === request.cat) {
            toRem[toRem.length] = j;
          }
        }
        for (j = toRem.length - 1; j >= 0; j--) {
          MANGA_LIST[i].cats.remove(toRem[j], toRem[j]);
        }
      }
    }
  }
  saveList();
  refreshUpdate();
  callback();
}

function editCategory (request, callback) {
  if (MANGA_LIST.length > 0) {
    for (var i = 0; i < MANGA_LIST.length; i++) {
      if (MANGA_LIST[i].cats.length > 0) {
        for (var j = 0; j < MANGA_LIST[i].cats.length; j++) {
          if (MANGA_LIST[i].cats[j] === request.cat) {
            MANGA_LIST[i].cats[j] = request.newcat;
          }
        }
      }
    }
  }
  saveList();
  refreshUpdate();
  callback();
}

function activatedMirrors () {
  var list = [];
  var states = localStorage.getItem('mirrorStates');
  var lstTmp = JSON.parse(states);
  if (lstTmp.length > 0) {
    for (var j = 0; j < lstTmp.length; j++) {
      if (lstTmp[j].activated === true) {
        list[list.length] = lstTmp[j];
      }
    }
  }
  return list;
}

function batchInjectScripts (tabId, scripts, callback) {
  function injectScript (scripts, index) {
    if (!scripts[index]) {
      return callback();
    }

    chrome.tabs.executeScript(tabId, {
      file: scripts[index]
    }, function () {
      console.log('injected script ' + scripts[index]); // TESTING
      injectScript(scripts, ++index);
    });
  }

  injectScript(scripts, 0);
}

function desactivateMirror (mirrorName) {
  var nb = 0;
  var j;
  for (var i = 0; i < MANGA_LIST.length; i++) {
    if (MANGA_LIST[i].mirror === mirrorName) {
      nb++;
    }
  }
  if (nb === 0) {
    var states = localStorage.getItem('mirrorStates');
    var lstTmp = JSON.parse(states);
    if (lstTmp.length > 0) {
      for (j = 0; j < lstTmp.length; j++) {
        if (lstTmp[j].mirror === mirrorName) {
          lstTmp[j] = {
            mirror : mirrorName,
            activated : false
          };
          localStorage.setItem('mirrorStates', JSON.stringify(lstTmp));
          wssql.webdb.empty(mirrorName, function () {});
          break;
        }
      }
    }
    var toRemove = -1;
    for (j = 0; j < actMirrors.length; j++) {
      if (actMirrors[j].mirrorName === mirrorName) {
        toRemove = j;
      }
    }
    if (toRemove !== -1) {
      actMirrors.remove(toRemove, toRemove);
    }
  }
}

function addBookmark (obj) {
  var isFound = false;
  var posFound;
  if (bookmarks && bookmarks.length > 0) {
    for (var j = 0; j < bookmarks.length; j++) {
      if (obj.mirror === bookmarks[j].mirror && obj.url === bookmarks[j].url && obj.chapUrl === bookmarks[j].chapUrl && obj.type === bookmarks[j].type) {
        if (obj.type === 'chapter') {
          isFound = true;
          posFound = j;
          break;
        }
        else {
          if (obj.scanUrl === bookmarks[j].scanUrl) {
            isFound = true;
            posFound = j;
            break;
          }
        }
      }
    }
  }
  if (!isFound && bookmarks && bookmarks.length) {
    bookmarks[bookmarks.length] = {
      mirror : obj.mirror,
      url : obj.url,
      chapUrl : obj.chapUrl,
      type : obj.type,
      name : obj.name,
      chapName : obj.chapName,
      scanUrl : obj.scanUrl,
      scanName : obj.scanName,
      note : obj.note
    };
  }
  else {
    bookmarks[posFound].note = obj.note;
  }

  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

function deleteBookmark (obj) {
  var isFound = false;
  var posFound;
  if (bookmarks && bookmarks.length > 0) {
    for (var j = 0; j < bookmarks.length; j++) {
      if (obj.mirror === bookmarks[j].mirror && obj.url === bookmarks[j].url && obj.chapUrl === bookmarks[j].chapUrl && obj.type === bookmarks[j].type) {
        if (obj.type === 'chapter') {
          isFound = true;
          posFound = j;
          break;
        }
        else {
          if (obj.scanUrl === bookmarks[j].scanUrl) {
            isFound = true;
            posFound = j;
            break;
          }
        }
      }
    }
  }
  if (isFound) {
    bookmarks.remove(posFound, posFound);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }
}

function getBookmark (obj) {
  if (bookmarks && bookmarks.length > 0) {
    for (var j = 0; j < bookmarks.length; j++) {
      if (obj.mirror === bookmarks[j].mirror && obj.url === bookmarks[j].url && obj.chapUrl === bookmarks[j].chapUrl && obj.type === bookmarks[j].type) {
        if (obj.type === 'chapter') {
          return {
            booked : true,
            note : bookmarks[j].note
          };
        }
        else {
          if (obj.scanUrl === bookmarks[j].scanUrl || encodeURI(obj.scanUrl) === bookmarks[j].scanUrl) {
            return {
              booked : true,
              note : bookmarks[j].note,
              scanSrc : obj.scanUrl
            };
          }
        }
      }
    }
  }
  return {
    booked : false,
    note : ''
  };
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (actionDipatcher(request, sender, sendResponse)) {
      return;
    }

    var mangaExist;
    var i;
    switch (request.action) {
      case 'readManga': {
        readManga(request, function () {
          sendResponse({});
        }, true);

        break;
      }

      case 'readMangas': {
        request.list.forEach(function (val) {
          readManga(val, function () {}, false);
        });

        saveList();
        refreshUpdate();
        sendResponse({});

        break;
      }

      case 'killManga': {
        killManga(request, function () {
          sendResponse({});
        }, true);

        break;
      }

      case 'killMangas': {
        request.list.forEach(function (val) {
          killManga(val, function () {}, false);
        });

        saveList();
        refreshUpdate();
        sendResponse({});

        break;
      }

      case 'resetManga': {
        resetManga(request, function () {
          sendResponse({});
        }, true);

        break;
      }

      case 'resetMangas': {
        request.list.forEach(function (val) {
          resetManga(val, function () {}, false);
        });

        saveList();
        refreshUpdate();
        sendResponse({});

        break;
      }

      case 'setMangaChapter': {
        resetManga(request, function () {
          readManga(request, function () {
            sendResponse({});
          }, true);
        }, false);

        break;
      }

      case 'markReadTop': {
        markReadTop(request, function () {
          if (request.updatesamemangas) {
            if (getParameters().groupmgs === 1) {
              mangaExist = isInMangaList(request.url);

              if (mangaExist !== null) {
                var othMg = getSimilarMangaTitles(mangaExist);

                if (othMg.length > 0) {
                  for (i = 0; i < othMg.length; i++) {
                    othMg.read = request.read;
                  }

                  saveList();
                  refreshUpdate();
                }
              }
            }

            sendResponse({});
          }
          else {
            sendResponse({});
          }
        }, true);

        break;
      }

      case 'markReadTops': {
        request.list.forEach(function (val) {
          markReadTop(val, function () {}, false);
        });

        saveList();
        refreshUpdate();
        sendResponse({});

        break;
      }

      case 'markUpdateTop': {
        markUpdateTop(request, function () {
          if (request.updatesamemangas) {
            if (getParameters().groupmgs === 1) {
              mangaExist = isInMangaList(request.url);

              if (mangaExist !== null) {
                var othMg = getSimilarMangaTitles(mangaExist);

                if (othMg.length > 0) {
                  for (i = 0; i < othMg.length; i++) {
                    othMg.update = request.update;
                  }

                  saveList();
                  refreshUpdate();
                }
              }
            }

            sendResponse({});
          }
          else {
            sendResponse({});
          }
        }, true);

        break;
      }

      case 'markUpdateTops': {
        request.list.forEach(function (val) {
          markUpdateTop(val, function () {}, false);
        });

        saveList();
        refreshUpdate();
        sendResponse({});

        break;
      }

      case 'addCategory': {
        addCategory(request, function () {
          sendResponse({});
        }, true);

        break;
      }

      case 'addCategories': {
        request.list.forEach(function (val) {
          addCategory(val, function () {}, false);
        });

        saveList();
        refreshUpdate();
        sendResponse({});

        break;
      }

      case 'removeCategory': {
        removeCategory(request, function () {
          sendResponse({});
        });

        break;
      }

      case 'removeCatManga': {
        removeCatManga(request, function () {
          sendResponse({});
        }, true);

        break;
      }

      case 'removeCatMangas': {
        request.list.forEach(function (val) {
          removeCatManga(val, function () {}, false);
        });

        saveList();
        refreshUpdate();
        sendResponse({});

        break;
      }

      case 'editCategory': {
        editCategory(request, function () {
          sendResponse({});
        });

        break;
      }

      case 'mangaInfos': {
        mangaExist = isInMangaList(request.url);
        var payload = null;

        if (mangaExist !== null) {
          payload = {
            read: mangaExist.read,
            display: mangaExist.display
          };
        }

        sendResponse(payload);

        break;
      }

      case 'setDisplayMode': {
        mangaExist = isInMangaList(request.url);

        if (mangaExist !== null) {
          mangaExist.display = request.display;
          saveList();
          refreshUpdate();
        }

        sendResponse({});

        break;
      }

      case 'parameters': {
        sendResponse(getParameters());

        break;
      }

      case 'saveparameters': {
        var ancParams = getParameters();
        var obj = {
          displayAds: request.displayAds,
          displayChapters: request.displayChapters,
          displayMode: request.displayMode,
          popupMode: request.popupMode,
          omSite: request.omSite,
          newTab: request.newTab,
          sync: request.sync,
          displayzero: request.displayzero,
          pub: request.pub,
          dev: request.dev,
          load: request.load,
          resize: request.resize,
          color: request.color,
          imgorder: request.imgorder,
          groupmgs: request.groupmgs,
          openupdate: request.openupdate,
          updatechap: request.updatechap,
          updatemg: request.updatemg,
          newbar: request.newbar,
          addauto: request.addauto,
          lrkeys: request.lrkeys,
          size: request.size,
          autobm: request.autobm,
          prefetch: request.prefetch,
          shownotifications: request.shownotifications,
          notificationtimer: request.notificationtimer,
          rightnext: request.rightnext,
          refreshspin: request.refreshspin,
          savebandwidth: request.savebandwidth,
          checkmgstart: request.checkmgstart,
          nocount: request.nocount,
          displastup: request.displastup,
          markwhendownload: request.markwhendownload,
          sendstats: request.sendstats,
          shownotifws: request.shownotifws,
          updated: ancParams.updated,
          syncAMR: ancParams.syncAMR
        };

        if (ancParams.sync !== obj.sync) {
          if (obj.sync === 1) {
            console.log('Synchronization started (parameter update)');
            sync.start();
          }
          else {
            console.log('Synchronization stopped (parameter update)');
            sync.stop();
          }
        }

        localStorage.setItem('parameters', JSON.stringify(obj));

        if (ancParams.nocount !== obj.nocount) {
          drawIcon(false);
        }

        if (ancParams.displayzero !== obj.displayzero || ancParams.groupmgs !== obj.groupmgs) {
          refreshTag();
        }

        if (ancParams.updatemg !== obj.updatemg || ancParams.updatechap !== obj.updatechap) {
          refreshMangaLists(true, false);
        }

        sendResponse({});

        break;
      }

      case 'opentab': {
        chrome.tabs.create({
          url: request.url
        });

        sendResponse({});

        break;
      }

      case 'openExtensionMainPage': {
        chrome.tabs.create({
          url: 'http://www.allmangasreader.com/'
        });

        sendResponse({});

        break;
      }

      case 'save': {
        saveList();
        sendResponse({});

        break;
      }

      case 'mirrors': {
        getFilledMirrorsDesc(activatedMirrors(), function (mirrorsDesc) {
          sendResponse(mirrorsDesc);
        });

        break;
      }

      case 'actmirrors': {
        getActivatedMirrorsWithList({
          list: activatedMirrors()
        }, sendResponse);

        break;
      }

      case 'searchManga': {
        var mangaMirror = getMangaMirror(request.mirrorName);

        if (mangaMirror !== null) {
          mangaMirror.getMangaList(request.search, function (mirror, lst) {
            request.list = lst;
            sendResponse(request);
          });
        }
        else {
          request.list = [];
          sendResponse(request);
        }

        break;
      }

      case 'searchMirrorsState': {
        sendResponse({
          res: localStorage.getItem('searchMirrorsState')
        });

        break;
      }

      case 'pagematchurls': {
        doesCurrentPageMatchManga(request.url, activatedMirrors(), function (isOk, mirrorName, implementationURL) {
          var docache = true;

          if (!isOk) {
            sendResponse({
              isOk: false
            });

            return;
          }

          if (implementationURL !== null && implementationURL.indexOf('.php') !== -1) {
            docache = false;
          }

          $.loadScript(implementationURL, docache, function (sScriptBody) {
             var tabId = sender.tab.id;
             var scriptObj = {
               code: sScriptBody
             };

             // inject all the scripts defined in the contentScript array (at the top of this file)
             batchInjectScripts(tabId, contentScripts, function () {
               chrome.tabs.executeScript(tabId, scriptObj, function () {
                 console.log('injected ' + implementationURL);

                 sendResponse({
                   isOk: isOk,
                   mirrorName: mirrorName,
                   implURL: implementationURL
                 });
               });
             });
           }, function () {
             console.log('Script ' + mirrorName + ' failed to be loaded in page...');

             sendResponse({
               isOk: false
             });
           }, 'text');
        });

        break;
      }

      case 'deletepub': {
        var params = getParameters();
        params.pub = 0;

        localStorage.setItem('parameters', JSON.stringify(params));

        sendResponse({});

        break;
      }

      case 'getListManga': {
        wssql.webdb.getMangaList(request.mirror, function (list) {
          var mangas = list;
          var mangaMirror;

          if (typeof mangas !== 'undefined' && mangas !== null && mangas.length > 0) {
            sendResponse(mangas);
          }
          else {
            mangaMirror = getMangaMirror(request.mirror);

            if (mangaMirror !== null) {
              mangaMirror.getMangaList('', function (name, lst) {
                sendResponse(lst);
              });
            }
            else {
              sendResponse([]);
            }
          }
        });

        break;
      }

      case 'getListChap': {
        var mangaMirror = getMangaMirror(request.mirror);
        mangaExist = isInMangaList(request.url);

        if (mangaExist === null) {
          if (mangaMirror !== null) {
            mangaMirror.getListChaps(request.mangaUrl, request.mangaName, null, function (lst, obj) {
              sendResponse(lst);
            });
          }
          else {
            sendResponse([]);
          }
        }
        else {
          sendResponse(mangaExist.listChaps);
        }

        break;
      }

      case 'nbMangaInMirror': {
        sendResponse({
          number: MANGA_LIST.filter(manga => manga.mirror === request.mirror).length,
          mirror: request.mirror
        });

        break;
      }

      case 'activateMirror': {
        activateMirror(request.mirror);
        sendResponse({});

        break;
      }

      case 'desactivateMirror': {
        desactivateMirror(request.mirror);
        sendResponse({});

        break;
      }

      case 'isMirrorActivated': {
        sendResponse({
          mirror: request.mirror,
          activated: isMirrorActivated(request.mirror)
        });

        break;
      }

      case 'activatedMirrors': {
        var lst = activatedMirrors();
        sendResponse({
          list: lst
        });

        break;
      }

      case 'addUpdateBookmark': {
        addBookmark(request);
        sendResponse({});

        break;
      }

      case 'deleteBookmark': {
        deleteBookmark(request);
        sendResponse({});

        break;
      }

      case 'getBookmarkNote': {
        var noteBM = getBookmark(request);

        sendResponse({
          isBooked: noteBM.booked,
          note: noteBM.note,
          scanSrc: noteBM.scanSrc
        });

        break;
      }

      case 'createContextMenu': {
        var url = request.lstUrls[0];
        var isFound = ctxIds.some(id => id === url);

        if (!isFound) {
          ctxIds.push(url);

          chrome.contextMenus.create({
            title: translate('background_bookmark_menu'),
            contexts: ['image'],
            targetUrlPatterns: [encodeURI(request.lstUrls[0]), request.lstUrls[0]],
            onclick: function (info, tab) {
              chrome.tabs.executeScript(tab.id, {
                code: 'clickOnBM(\'' + info.srcUrl + '\')'
              }, $.noop);
            }
          }, sendResponse.bind(null, {}));
        }
        else {
          sendResponse({});
        }

        break;
      }

      case 'importMangas': {
        sendResponse({
          out: importMangas(request.mangas, request.merge)
        });

        break;
      }

      case 'importBookmarks': {
        sendResponse({
          out: importBookmarks(request.bookmarks, request.merge)
        });

        break;
      }

      case 'hideBar': {
        var isBarVisible = localStorage.getItem('isBarVisible');
        var barState = isBarVisible ? 1 : 0;
        localStorage.setItem('isBarVisible', barState);

        sendResponse({
          res: barState
        });

        break;
      }

      case 'showBar': {
        localStorage.setItem('isBarVisible', 1);
        sendResponse({});

        break;
      }

      case 'barState': {
        var isBarVisible = localStorage.getItem('isBarVisible');
        var barState = isBarVisible === null ? 1 : isBarVisible;

        sendResponse({
          barVis: barState
        });

        break;
      }

      case 'getNextChapterImages': {
        $.ajax({
          url: request.url,

          success: function (data) {
            var div = document.createElement('iframe');
            var $div = $(div).hide();
            var id = 'mangaNextChap';
            var i = $('[id^=' + id).length;

            id = id + i;
            $div.attr('id', id);

            document.body.appendChild(div);

            var frame = document.getElementById(id).contentWindow.document;
            frame.documentElement.innerHTML = data;

            $(frame).ready(function () {
              var imagesUrl = getMangaMirror(request.mirrorName).getListImages(frame, request.url);

              sendResponse({
                images: imagesUrl
              });

              $('#' + id).remove();
            });
          },

          error: function () {
            sendResponse({
              images: null
            });
          }
        });

        break;
      }

      case 'mangaList': {
        sendResponse({
          lst: MANGA_LIST,
          ts: ((getParameters().syncAMR) ? getParameters().syncAMR : 0),
          haschange: (getParameters().changesSinceSync === 1)
        });

        break;
      }

      case 'updateFromSite': {
        updateFromSite(request.lst, true);
        refreshUpdateSyncSite(request.ts);
        sendResponse({});

        break;
      }

      case 'replaceFromSite': {
        updateFromSite(request.lst, false);
        refreshUpdateSyncSite(request.ts);
        sendResponse({});

        break;
      }

      case 'siteUpdated': {
        refreshUpdateSyncSite(request.ts);
        sendResponse({});

        break;
      }

      case 'readMgForStat': {
        pstat.webdb.addStat(request, function (ltId) {
          sendResponse({
            id: ltId
          });
        });

        break;
      }

      case 'updateMgForStat': {
        pstat.webdb.updateStat(request.id, request.time_spent, function () {
          sendResponse({});
        });

        break;
      }

      case 'updateMirrors': {
        updateMirrors(function (resp) {
          sendResponse(resp);
        });
        break;
      }

      case 'importimplementation': {
        importImplentationFromId(request.id, function (mirrorName) {
          updateMirrors(function () {
            sendResponse({
              mirror: mirrorName
            });
          });
        });

        break;
      }

      case 'releaseimplementation': {
        releaseImplentationFromId(request.id, function (mirrorName) {
          updateMirrors(function () {
            sendResponse({
              mirror: mirrorName
            });
          });
        });

        break;
      }
    }

    return true;
  }
);

function hasDesactivatedOnce () {
  var states = localStorage.getItem('mirrorStates');
  var list;
  var nbActi = 0;

  if (states) {
    list = JSON.parse(states);

    nbActi = list.filter(item => item.activated).length;
  }

  return nbActi <= 25;
}

function ease (x) {
  return (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2;
}

function hasNew () {
  var lastName;
  var i = -1;
  var length = MANGA_LIST.length;

  while (++i < length) {
    if (MANGA_LIST[i].listChaps.length > 0) {
      lastName = MANGA_LIST[i].listChaps[0][1];

      if (lastName !== MANGA_LIST[i].lastChapterReadURL && MANGA_LIST[i].read === 0) {
        return true;
      }
    }
  }

  return false;
}

function drawIconAtRotation (doEase) {
  if (typeof doEase === 'undefined') {
    doEase = false;
  }

  canvasContext.save();
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  canvasContext.translate(canvas.width / 2, canvas.height / 2);
  canvasContext.rotate(2 * Math.PI * (doEase ? ease(rotation) : rotation));
  canvasContext.drawImage(sharinganImage, -canvas.width / 2, -canvas.height / 2);

  if (getParameters().nocount === 1 && !hasNew()) {
    grayscale(canvasContext, canvas.width, canvas.height);
  }

  canvasContext.restore();

  chrome.browserAction.setIcon({
    imageData : canvasContext.getImageData(0, 0, canvas.width, canvas.height)
  });
}

WaitForAllLists.prototype.incMade = function () {
  this.nbMade++;
};

WaitForAllLists.prototype.wait = function () {
  if (!this.started) {
    this.started = true;
  }

  if (this.sizeAll <= this.nbMade) {
    if (this.doSpin) {
      rotation += 1 / animationFrames;

      if (rotation > 1) {
        rotation = 0;
        drawIconAtRotation(true);
        this.onFinish();
      }
      else {
        drawIconAtRotation();
        setTimeout(this.wait.bind(this), animationSpeed);
      }
    }
    else {
      this.onFinish();
    }
  }
  else {
    if (this.doSpin) {
      rotation += 1 / animationFrames;

      if (rotation > 1) {
        rotation = rotation - 1;
        this.doEase = false;
      }

      drawIconAtRotation(this.doEase);
    }

    setTimeout(this.wait.bind(this), animationSpeed);
  }
};

function refreshUpdateSyncSite (update) {
  try {
    var params = getParameters();
    params.syncAMR = update;
    params.changesSinceSync = 0;
    localStorage.setItem('parameters', JSON.stringify(params));
  }
  catch (e) {
    console.error(e);
  }
}

function resetUpdate () {
  try {
    var params = getParameters();
    params.updated = undefined;
    localStorage.setItem('parameters', JSON.stringify(params));
  }
  catch (e) {
    console.error(e);
  }
}

function getExtensionVersion () {
  if (!chrome.extension.version_) {
    initManifestVars();
  }

  return chrome.extension.version_;
}

function initManifestVars () {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', chrome.extension.getURL('manifest.json'), false);

  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      var manifest = JSON.parse(this.responseText);
      chrome.extension.version_ = manifest.version;
      chrome.extension.beta_ = manifest.homepage_url.indexOf('github.com') > 0;
    }
  };

  xhr.send();
}

function setclipboard (text) {
  var txt = document.createElement('textarea');
  txt.value = text;
  document.body.appendChild(txt);
  txt.select();
  document.execCommand('Copy');
  document.body.removeChild(txt);
}

function deleteMangas (mangasToDel) {
  var deleteAr = [];
  var i;

  for (i = 0; i < mangasToDel.length; i++) {
    var tmpManga = new MangaElt(mangasToDel[i]);
    var mangaExist = isInMangaListId(tmpManga.url);

    if (mangaExist !== -1) {
      deleteAr[deleteAr.length] = mangaExist;
    }
  }

  deleteAr.sort(function (a, b) {
    return ((a < b) ? -1 : ((a === b) ? 0 : 1));
  });

  for (i = deleteAr.length - 1; i >= 0; i--) {
    MANGA_LIST.remove(deleteAr[i], deleteAr[i]);
  }
}

function importMangas (mangas, merge) {
  var textOut = '';
  var i;
  var deleteAr = [];

  if (!merge) {
    textOut += translate('background_impexp_del') + '\n';

    for (i = 0; i < MANGA_LIST.length; i++) {
      textOut += '\t - ' + translate('background_impexp_del_ent', [MANGA_LIST[i].name, MANGA_LIST[i].mirror]) + '\n';
      deleteAr[deleteAr.length] = i;
    }

    for (i = deleteAr.length - 1; i >= 0; i--) {
      MANGA_LIST.remove(deleteAr[i], deleteAr[i]);
    }
  }

  textOut += translate('background_impexp_add') + '\n';

  var lstTmp = mangas;

  for (i = 0; i < lstTmp.length; i++) {
    var tmpManga = new MangaElt(lstTmp[i]);
    var mangaExist = isInMangaList(tmpManga.url);

    textOut += '\t - ' + translate('background_impexp_read', [tmpManga.name, tmpManga.mirror]) + '\n';

    if (mangaExist === null) {
      textOut += '\t  --> ' + translate('background_impexp_mg_notfound') + '\n';

      if (!isMirrorActivated(tmpManga.mirror)) {
        activateMirror(tmpManga.mirror);
      }

      var last = MANGA_LIST.length;

      MANGA_LIST[last] = tmpManga;
    }
    else {
      textOut += '\t  --> ' + translate('background_impexp_mg_syncchap', [tmpManga.lastChapterReadURL, mangaExist.lastChapterReadURL]) + '\n';
      mangaExist.consult(tmpManga);
    }
  }

  refreshAllLasts();
  return textOut;
}

function updateFromSite (mangas, merge) {
  var i;
  var tmpManga;
  var mangaExist;

  if (!merge) {
    var deleteAr = [];

    for (i = 0; i < MANGA_LIST.length; i++) {
      deleteAr[deleteAr.length] = i;
    }

    for (i = deleteAr.length - 1; i >= 0; i--) {
      MANGA_LIST.remove(deleteAr[i], deleteAr[i]);
    }
  }

  for (i = 0; i < mangas.length; i++) {
    var mg = mangas[i];

    if (mg.change === 'new') {
      tmpManga = new MangaElt(mg);

      if (!isMirrorActivated(tmpManga.mirror)) {
        activateMirror(tmpManga.mirror);
      }

      var last = MANGA_LIST.length;
      MANGA_LIST[last] = tmpManga;
    }
    else if (mg.change === 'delete') {
      mangaExist = isInMangaListId(mg.url);

      if (mangaExist !== -1) {
        MANGA_LIST.remove(mangaExist, mangaExist);
      }
    }
    else {
      tmpManga = new MangaElt(mg);
      mangaExist = isInMangaList(tmpManga.url);

      if (mangaExist !== null) {
        mangaExist.consult(tmpManga, true);
      }
    }
  }

  refreshAllLasts();
}

function importBookmarks (bms, merge) {
  var textOut = '';
  var i;

  if (!merge) {
    textOut += translate('background_impexp_del_bm') + '\n';

    var deleteAr = [];

    if (bookmarks !== null) {
      for (i = 0; i < bookmarks.length; i++) {
        textOut += '\t - ' + translate('background_impexp_del_onebm') + ' : (type: ' + bookmarks[i].type + ', url: ' + bookmarks[i].url + ', chapter url: ' + bookmarks[i].chapUrl + ', mirror: ' + bookmarks[i].mirror + ((bookmarks[i].type === 'chapter') ? '' : ', scanName: ' + bookmarks[i].scanName) + ', note: ' + bookmarks[i].note + ')' + '\n';
        deleteAr[deleteAr.length] = i;
      }

      for (i = deleteAr.length - 1; i >= 0; i--) {
        bookmarks.remove(deleteAr[i], deleteAr[i]);
      }
    }
  }

  textOut += translate('background_impexp_add_bm') + '\n';

  var lstTmp = bms;

  for (i = 0; i < lstTmp.length; i++) {
    textOut += '\t - ' + translate('background_impexp_read_entry') + ' : (type: ' + lstTmp[i].type + ', url: ' + lstTmp[i].url + ', chapter url: ' + lstTmp[i].chapUrl + ', mirror: ' + lstTmp[i].mirror + ((lstTmp[i].type === 'chapter') ? '' : ', scanName: ' + lstTmp[i].scanName) + ', note: ' + lstTmp[i].note + ')' + '\n'

    var isFound = false;
    var posFound;
    var obj = lstTmp[i];

    if (bookmarks && bookmarks.length > 0) {
      for (var j = 0; j < bookmarks.length; j++) {
        if (obj.mirror === bookmarks[j].mirror && obj.url === bookmarks[j].url && obj.chapUrl === bookmarks[j].chapUrl && obj.type === bookmarks[j].type) {
          if (obj.type === 'chapter') {
            isFound = true;
            posFound = j;

            break;
          }
          else {
            if (obj.scanUrl === bookmarks[j].scanUrl) {
              isFound = true;
              posFound = j;

              break;
            }
          }
        }
      }
    }

    if (!isFound) {
      textOut += '\t  --> ' + translate('background_impexp_new_bm') + '\n';

      bookmarks[bookmarks.length] = {
        mirror : obj.mirror,
        url : obj.url,
        chapUrl : obj.chapUrl,
        type : obj.type,
        name : obj.name,
        chapName : obj.chapName,
        scanUrl : obj.scanUrl,
        scanName : obj.scanName,
        note : obj.note
      };
    }
    else {
      textOut += '\t  --> ' + translate('background_impexp_bm_merge') + '\n';
      bookmarks[posFound].note = obj.note;
    }
  }

  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

  return textOut;
}

$(function () {
  pstat.init();
  wssql.init();
  amrcsql.init();
  init();
});
