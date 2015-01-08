/*globals translate, wssql, MangaElt, BSync, getMangaMirror*/
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

function jsonmangaelt (mangaelt) {
  var obj = {
    mirror: mangaelt.mirror,
    name: mangaelt.name,
    url: mangaelt.url,
    lastChapterReadURL: mangaelt.lastChapterReadURL,
    lastChapterReadName: mangaelt.lastChapterReadName,
    read: mangaelt.read,
    update: mangaelt.update,
    display: mangaelt.display,
    ts: mangaelt.ts,
    upts: mangaelt.upts,
    listChaps: JSON.stringify(mangaelt.listChaps),
    cats: JSON.stringify(mangaelt.cats)
  };

  return JSON.stringify(obj);
}

function getJSONList () {
  var results = [];
  $.each(MANGA_LIST, function (index, object) {
    var value = jsonmangaelt(object);
    if (value !== undefined) {
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
  canvasContext.save();
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  canvasContext.translate(canvas.width / 2, canvas.height / 2);
  canvasContext.drawImage(sharinganImage, -canvas.width / 2, -canvas.height / 2);
  if (isgrey) {
    grayscale(canvasContext, canvas.width, canvas.height);
  }
  canvasContext.restore();
  chrome.browserAction.setIcon({
    imageData : canvasContext.getImageData(0, 0, canvas.width, canvas.height)
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
    try {
      refreshTag();
    }
    catch (e) {
      console.log(e);
    }
  }
  catch (e) {
    console.log(e);
  }
}

function refreshUpdateWith (update) {
  try {
    var params = getParameters();
    params.updated = update;
    localStorage.setItem('parameters', JSON.stringify(params));
  }
  catch (e) {
    console.log(e);
  }
}

function refreshSync () {
  try {
    var params = getParameters();
    params.lastsync = new Date().getTime();
    localStorage.setItem('parameters', JSON.stringify(params));
  }
  catch (e) {
    console.log(e);
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
  var results = [];
  $.each(MANGA_LIST, function (index, object) {
    var value = jsonmangaelttosync(object);
    if (value !== undefined) {
      results.push(value);
    }
  });
  return '[' + results.join(', ') + ']';
}

// Here we shouldn't be using this...
var sync = new BSync({
  getUpdate : function () {
    // console.log('GET UPDATE');
    var params = getParameters();
    return params.updated;
  },

  onRead : function (json, bookmark) {
    console.log('Reading incoming synchronisation');

    if (!(typeof json === 'undefined' || json === null || json === 'null')) {
      console.log(' - Updating incoming entries');

      // var lstTmp = $A(eval('(' + json.mangas + ')')); --> remove prototype usage

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
          var last = MANGA_LIST.length;
          MANGA_LIST[last] = tmpManga;
          MANGA_LIST[last].refreshLast();
        }
        else {
          // Verify chapter last
          console.log('\t  --> Manga found in current list, verify last chapter read. incoming : ' + tmpManga.lastChapterReadURL + '; current : ' + mangaExist.lastChapterReadURL);
          mangaExist.consult(tmpManga);
          saveList();
        }
      }

      console.log(' - Deleting mangas not in incoming list');
      var deleteAr = [];
      for (i = 0; i < MANGA_LIST.length; i++) {
        var found = false;
        for (var j = 0; j < lstTmp.length; j++) {
          tmpManga = new MangaElt(lstTmp[j]);
          if (MANGA_LIST[i].url === tmpManga.url) {
            found = true;
            break;
          }
        }
        if (!found) {
          console.log('\t - Deleting manga entry in current list : ' + MANGA_LIST[i].name + ' in mirror : ' + MANGA_LIST[i].mirror);
          deleteAr[deleteAr.length] = i;
        }
      }
      for (i = deleteAr.length - 1; i >= 0; i--) {
        MANGA_LIST.remove(deleteAr[i], deleteAr[i]);
      }
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
      path : 'img/blue-sharingan.png'
    });

    statusReady = statusReadyT;

    if (reason !== undefined) {
      reason = reasonT;
    }

    return;
  }

  if (statusReadyT === true && statusReady === false) {
    chrome.browserAction.setIcon({
      path : 'img/amrlittle.png'
    });
    statusReady = statusReadyT;
    reason = null;
    return;
  }

  if (typeof statusReadyT === 'undefined' && typeof reasonT === 'undefined') {
    return {
      statusReady : statusReady,
      reason : reason
    };
  }
}

function replaceInUrls (url, find, rep) {
  var res = url;
  if (url !== undefined && url !== null && url.indexOf(find) !== -1) {
    res = url.replace(find, rep);
  }
  return res;
}

function instantiateMirrors () {
  var lst = [];
  for (var i = 0; i < mirrors.length; i++) {
    lst[lst.length] = {
      mirror : mirrors[i].mirrorName,
      activated : true
    };
  }
  localStorage.setItem('mirrorStates', JSON.stringify(lst));
}

function initMirrorState () {
  var states = localStorage.getItem('mirrorStates');
  if (typeof states === 'undefined' || states === null || states === 'null') {
    instantiateMirrors();
  }
  else {
    var lstTmp = JSON.parse(states);

    if (lstTmp.length > 0) {
      var toUpdate = false;

      for (var i = 0; i < mirrors.length; i++) {
        var isFound = false;

        for (var j = 0; j < lstTmp.length; j++) {
          if (lstTmp[j].mirror === mirrors[i].mirrorName) {
            isFound = true;
            break;
          }
        }

        if (!isFound) {
          lstTmp[lstTmp.length] = {
            mirror : mirrors[i].mirrorName,
            activated : true
          };

          toUpdate = true;
        }
      }

      if (toUpdate) {
        localStorage.setItem('mirrorStates', JSON.stringify(lstTmp));
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

      var mangasToRefreshCount = 0;
      var pos = 0;
      var mirror;

      for (i = 0; i < MANGA_LIST.length; i++) {
        if (getMangaMirror(MANGA_LIST[i].mirror) !== null) {
          mangasToRefreshCount++;
        }
      }

      var waiter = new WaitForAllLists(mangasToRefreshCount, saveList, params.refreshspin);

      for (i = 0; i < MANGA_LIST.length; i++) {
        mirror = getMangaMirror(MANGA_LIST[i].mirror);
        if (mirror !== null && mirror.savebandwidth === undefined || !mirror.savebandwidth) {
          refreshManga(MANGA_LIST[i], waiter, pos);
          pos++;
        }
      }

      for (i = 0; i < MANGA_LIST.length; i++) {
        mirror = getMangaMirror(MANGA_LIST[i].mirror);
        if (mirror !== null && mirror.savebandwidth !== undefined && mirror.savebandwidth) {
          refreshManga(MANGA_LIST[i], waiter, pos);
          pos++;
        }
      }

      waiter.wait();
    }
  }
  catch (e) {
    console.log(e);
  }

  var nextTime = params.updatechap;
  if (refreshTimer) {
    clearTimeout(timeoutChap);
    nextTime =  -(new Date().getTime() - localStorage.getItem('lastChaptersUpdate') - nextTime);
  }

  console.log('Next time to refresh chapters list : ' + nextTime);
  timeoutChap = setTimeout(refreshAllLasts, nextTime);
}

function refreshMangaLists (refreshTimer, perform) {
  try {
    if (perform === undefined || perform === true) {
      console.log('Refreshing mangas lists at ' + new Date());
      localStorage.setItem('lastMangasUpdate', new Date().getTime());
      for (var i = 0; i < mirrors.length; i++) {
        if (mirrors[i].canListFullMangas && isMirrorActivated(mirrors[i].mirrorName)) {
          mirrors[i].getMangaList('', mangaListLoaded);
        }
      }
    }
  }
  catch (e) {
    console.log(e);
  }

  var nextTime = getParameters().updatemg;

  if (refreshTimer) {
    clearTimeout(timeoutMg);
    nextTime = -(new Date().getTime() - localStorage.getItem('lastMangasUpdate') - nextTime);
  }

  console.log('Next time to refresh manga list : ' + nextTime);

  timeoutMg = setTimeout(refreshMangaLists, nextTime);
}

function refreshNewMirrorsMangaLists () {
  for (var i = 0; i < mirrors.length; i++) {
    if (mirrors[i].canListFullMangas && isMirrorActivated(mirrors[i].mirrorName)) {
      wssql.webdb.getMangaList(mirrors[i].mirrorName, function (list, mirror) {
        if (!list || list === null || list.length === 0) {
          console.log('New web site added : ' + mirror + ' --> loading manga list');
          getMangaMirror(mirror).getMangaList('', mangaListLoaded);
        }
      });
    }
  }
}

function updateMirrors (callback) {
  getMirrors(function (mirrorsT) {
    mirrors = mirrorsT;
    initMirrorState();
    actMirrors = [];

    for (var i = 0; i < mirrors.length; i++) {
      if (isMirrorActivated(mirrors[i].mirrorName)) {
        actMirrors[actMirrors.length] = mirrors[i];
      }
    }

    refreshNewMirrorsMangaLists();
    callback();
  });
}

function refreshWebsites (refreshTimer, perform) {
  try {
    if (perform === undefined || perform === true) {
      console.log('Refreshing websites implementations at ' + new Date());
      localStorage.setItem('lastWsUpdate', new Date().getTime());
      updateWebsitesFromRepository(function () {
        updateMirrors(function () {});
      });
    }
  }
  catch (e) {
    console.log(e);
  }
  var nextTime = updatews;
  if (refreshTimer) {
    clearTimeout(timeoutWs);
    nextTime =  - (new Date().getTime() - localStorage.getItem('lastWsUpdate') - nextTime);
  }
  console.log('Next time to refresh websites implementations : ' + nextTime);
  timeoutWs = setTimeout(function () {
    refreshWebsites();
  }, nextTime);
}

function getDailyStr () {
  var d = new Date();
  var m = d.getMonth() + 1;
  var mstr = '' + m;
  if (m < 10) {
    mstr = '0' + mstr;
  }
  var j = d.getDate();
  var jstr = '' + j;
  if (j < 10) {
    jstr = '0' + jstr;
  }
  return d.getFullYear() + '/' + mstr + '/' + jstr;
}

function getWeeklyStr () {
  var d = new Date();
  var w = d.getWeek();
  var wstr = '' + w;
  if (w < 10) {
    wstr = '0' + wstr;
  }
  return d.getFullYear() + '/' + wstr;
}

function getMonthlyStr () {
  var d = new Date();
  var m = d.getMonth() + 1;
  var mstr = '' + m;
  if (m < 10) {
    mstr = '0' + mstr;
  }
  return d.getFullYear() + '/' + mstr;
}

function formatMgName (name) {
  if (name === undefined || name === null || name === 'null') {
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

/* Initialise the list of followed mangas */
function init () {
  getMirrors(function (mirrorsT) {
    mirrors = mirrorsT;
    var i;

    var doDeleteMirs = false;

    for (i = 0; i < mirrors.length; i++) {
      if (localStorage[mirrors[i].mirrorName]) {
        doDeleteMirs = true;
        localStorage.removeItem(mirrors[i].mirrorName);
      }
    }

    if (doDeleteMirs) {
      localStorage.removeItem('lastMangasUpdate');
    }

    initMirrorState();
    actMirrors = [];

    for (i = 0; i < mirrors.length; i++) {
      if (isMirrorActivated(mirrors[i].mirrorName)) {
        actMirrors[actMirrors.length] = mirrors[i];
      }
    }

    var list = localStorage.getItem('mangas');
    MANGA_LIST = [];

    if (!(list === undefined || list === null || list === 'null')) {
      var mangas = JSON.parse(list);

      for (i = 0; i < mangas.length; i++) {
        mangas[i].url = replaceInUrls(mangas[i].url, 'submanga.me', 'submanga.com');
        mangas[i].lastChapterReadURL = replaceInUrls(mangas[i].lastChapterReadURL, 'submanga.me', 'submanga.com');
        mangas[i].url = replaceInUrls(mangas[i].url, 'www.mangafox.com', 'mangafox.me');
        mangas[i].lastChapterReadURL = replaceInUrls(mangas[i].lastChapterReadURL, 'www.mangafox.com', 'mangafox.me');
        MANGA_LIST[i] = new MangaElt(mangas[i]);
      }
    }

    var bms = localStorage.getItem('bookmarks');
    if (bms !== undefined) {
      bookmarks = JSON.parse(bms);
    }
    else {
      bookmarks = [];
    }

    var pars = getParameters();
    var ancVersion = localStorage.getItem('version');
    if (ancVersion === undefined || ancVersion === null || ancVersion === 'null') {
      ancVersion = null;
    }

    var curVersion = chrome.extension.getVersion();
    if (ancVersion === null || curVersion !== ancVersion) {
      localStorage.setItem('version', curVersion);
      if (pars.openupdate === 1) {
        if (chrome.extension.isBeta()) {
          chrome.tabs.getAllInWindow(undefined, function (tabs) {
            var tab;
            while (tab = tabs.shift()) {
              if (tab.url && tab.url === 'https://github.com/AllMangasReader-dev/AMR/commits/develop') {
                chrome.tabs.update(tab.id, {
                  selected : true
                });
                return;
              }
            }

            chrome.tabs.create({
              'url' : 'https://github.com/AllMangasReader-dev/AMR/commits/develop'
            });
          });
        }
        else {
          chrome.tabs.create({
            'url' : 'http://wiki.allmangasreader.com/changelog'
          });
        }
      }
      localStorage.setItem('versionViewRelease', localStorage.getItem('version'));
    }

    if (chrome.extension.isBeta()) {
      chrome.browserAction.setTitle({
        title : 'All Mangas Reader Beta Channel ' + curVersion
      });
    }
    else {
      chrome.browserAction.setTitle({
        title : 'All Mangas Reader ' + curVersion
      });
    }

    // var dailyStr = getDailyStr();
    // var weeklyStr = getWeeklyStr();
    // var monthlyStr = getMonthlyStr();

    saveList();

    var nextTime;

    if (pars.sync === 1) {
      console.log('synchronization started');
      sync.start();
    }
    if (!localStorage.getItem('lastChaptersUpdate')) {
      refreshAllLasts();
    }
    else {
      if (pars.checkmgstart === 1) {
        refreshAllLasts();
      }
      else {
        nextTime = new Date().getTime() - localStorage.getItem('lastChaptersUpdate') - pars.updatechap;
        if (nextTime > 0) {
          refreshAllLasts();
        }
        else {
          console.log('Next time to refresh chapters list : ' + (-nextTime));
          timeoutChap = setTimeout(function () {
            refreshAllLasts();
          }, -nextTime);
        }
      }
    }
    if (!localStorage.getItem('lastMangasUpdate')) {
      refreshMangaLists();
    }
    else {
      nextTime = new Date().getTime() - localStorage.getItem('lastMangasUpdate') - pars.updatemg;
      if (nextTime > 0) {
        refreshMangaLists();
      }
      else {
        console.log('Next time to refresh manga list : ' + (-nextTime));
        timeoutMg = setTimeout(refreshMangaLists, -nextTime);
        refreshNewMirrorsMangaLists();
      }
    }
    if (!localStorage.getItem('lastWsUpdate')) {
      refreshWebsites();
    }
    else {
      nextTime = new Date().getTime() - localStorage.getItem('lastWsUpdate') - updatews;
      if (nextTime > 0) {
        refreshWebsites();
      }
      else {
        console.log('Next time to refresh websites : ' + (-nextTime));
        timeoutWs = setTimeout(refreshWebsites, -nextTime);
      }
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
        $.each(request.list, function (index, val) {
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
        $.each(request.list, function (index, val) {
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
        $.each(request.list, function (index, val) {
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
        $.each(request.list, function (index, val) {
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
        $.each(request.list, function (index, val) {
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
        $.each(request.list, function (index, val) {
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
        $.each(request.list, function (index, val) {
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
        if (mangaExist !== null) {
          sendResponse({
            read: mangaExist.read,
            display: mangaExist.display
          });
        }
        else {
          sendResponse(null);
        }
        break;
      }

      case 'setDisplayMode': {
        mangaExist = isInMangaList(request.url);
        if (mangaExist !== null) {
          mangaExist.display = request.display;
          saveList();
          refreshUpdate();
          sendResponse({});
        }
        else {
          sendResponse({});
        }
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
            console.log('synchronization started (parameter update)');
            sync.start();
          }
          else {
            console.log('synchronization stopped (parameter update)');
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
        }, function (mirrorsDesc) {
          sendResponse(mirrorsDesc);
        });
        break;
      }

      case 'searchManga': {
        if (getMangaMirror(request.mirrorName) !== null) {
          getMangaMirror(request.mirrorName)
          .getMangaList(request.search, function (mirror, lst) {
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
             // inject all the scripts defined in the contentScript array (at the top of this file)
             batchInjectScripts(tabId, contentScripts, function () {
               chrome.tabs.executeScript(tabId, {
                 code: sScriptBody
               }, function () {
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
          if (mangas !== undefined && mangas !== null && mangas.length > 0) {
            sendResponse(mangas);
          }
          else {
            if (getMangaMirror(request.mirror) !== null) {
              getMangaMirror(request.mirror).getMangaList('', function (name, lst) {
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
        mangaExist = isInMangaList(request.url);
        if (mangaExist === null) {
          if (getMangaMirror(request.mirror) !== null) {
            getMangaMirror(request.mirror).getListChaps(request.mangaUrl, request.mangaName, null, function (lst, obj) {
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
        var nb = 0;
        for (i = 0; i < MANGA_LIST.length; i++) {
          if (MANGA_LIST[i].mirror === request.mirror) {
            nb++;
          }
        }
        sendResponse({
          number: nb,
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
        var isFound = false;

        if (ctxIds.length > 0) {
          for (i = 0; i < ctxIds.length; i++) {
            if (ctxIds[i] === request.lstUrls[0]) {
              isFound = true;
              break;
            }
          }
        }

        if (!isFound) {
          ctxIds[ctxIds.length] = request.lstUrls[0];
          var id = chrome.contextMenus.create({
            title: translate('background_bookmark_menu'),
            contexts: ['image'],
            onclick: function (info, tab) {
              chrome.tabs.executeScript(tab.id, {
                code: 'clickOnBM(\'' + info.srcUrl + '\')'
              }, function () {});
            },
            targetUrlPatterns: [encodeURI(request.lstUrls[0]), request.lstUrls[0]]
          }, function () {
            sendResponse({});
          });
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
        if (localStorage.getItem('isBarVisible') === 1) {
          localStorage.setItem('isBarVisible', 0);
          console.log('hiding bar');
        }
        else {
          localStorage.setItem('isBarVisible', 1);
        }
        sendResponse({
          res: localStorage.getItem('isBarVisible')
        });
        break;
      }

      case 'showBar': {
        localStorage.setItem('isBarVisible', 1);
        sendResponse({});
        break;
      }

      case 'barState': {
        if (typeof localStorage.getItem('isBarVisible') === 'undefined') {
          sendResponse({
            barVis: 1
          });
        }
        else {
          sendResponse({
            barVis: localStorage.getItem('isBarVisible')
          });
        }
        break;
      }

      case 'getNextChapterImages': {
        $.ajax({
          url: request.url,
          success: function (data) {
            var div = document.createElement('iframe');
            div.style.display = 'none';
            var id = 'mangaNextChap';
            var i = 0;
            while ($('#' + id + i).length > 0) {
              i++;
            }
            id = id + i;
            $(div).attr('id', id);
            document.body.appendChild(div);
            document.getElementById(id).contentWindow.document.documentElement.innerHTML = data;
            $(document.getElementById(id).contentWindow.document).ready(function () {
              var imagesUrl = getMangaMirror(request.mirrorName).getListImages(document.getElementById(id).contentWindow.document, request.url);
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

function hasNew () {
  var lastName;

  for (var i = 0; i < MANGA_LIST.length; i++) {
    if (MANGA_LIST[i].listChaps.length > 0) {
      lastName = MANGA_LIST[i].listChaps[0][1];

      if (lastName !== MANGA_LIST[i].lastChapterReadURL && MANGA_LIST[i].read === 0) {
        return true;
      }
    }
  }

  return false;
}

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

chrome.extension.getVersion = function () {
  if (!chrome.extension.version_) {
    initManifestVars();
  }

  return chrome.extension.version_;
}

chrome.extension.isBeta = function () {
  if (chrome.extension.beta_ === undefined) {
    initManifestVars();
  }

  return chrome.extension.beta_;
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

  if (!merge) {
    textOut += translate('background_impexp_del') + '\n';
    var deleteAr = [];
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
    textOut += '\t - ' + translate('background_impexp_read', [tmpManga.name, tmpManga.mirror]) + '\n';
    var mangaExist = isInMangaList(tmpManga.url);
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
