/*globals wssql, amrcsql, getParameters*/

var AMRC_REPOSITORY = 'https://ssl10.ovh.net/~allmanga/community/latest_v2/';
var AMRC_ROOT = 'https://ssl10.ovh.net/~allmanga/community/';
var AMRC_REPOSITORY_BACKUP = 'https://raw.github.com/AllMangasReader-dev/mirrors/master/';

function displayNotification (/*wsData, params*/) {
  console.log('noop');
  /*  var text = '';
  if (wsData.revision > 0) {
    if (wsData.isnew) {
      text = 'Implementation created by ' + wsData.developer + '.';
    }
    else {
      text = 'Implementation updated by ' + wsData.developer + ' (revision ' + wsData.revision + ').\nThis may have fixed issues on this website !';
    }
  }
  else {
    text = 'Implementation updated for a temporary version. (developer : ' + wsData.developer + ').\nIf you want to come back to normal revision, go to option page, 'Supported websites' tab.';
  }
  text += '\nYou can discuss this implementation by clicking on the notification (login required)';
  var notif = window.webkitNotifications.createNotification(chrome.extension.getURL('img/icon-32.png'), wsData.ws, text);
  notif.url = 'http://community.allmangasreader.com/comments.php?type=1&id=' + wsData.idext;
  notif.onclick = function () {
    var myurl = this.url;
    // notif.cancel() should hide the notif once clicked
    notif.cancel();
    chrome.tabs.create({
      'url' : myurl
    });
  };
  notif.show();
  if (params.notificationtimer > 0) {
    setTimeout(function () {
      notif.cancel();
    }, params.notificationtimer * 1000);
  }*/
}

// ##############################################################################
// Load websites description and code in one array. Do first load if necessary.
// Insert in database if first load.
// ##############################################################################

function validURL (str) {
  var re = /^s?https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+$/;
  var res = str.match(re);

  return res !== null && res.index === 0;
}

function getMirrorsDescription (callback) {
  amrcsql.webdb.getWebsites(function (list) {
    var websites = list;
    var mustUpdate = false;
    var i;

    if (websites !== undefined && websites !== null && websites.length > 0) {
      // For compatibility, check if websites jsCode is a url and not an implementation
      for (i = 0; i < websites.length; i += 1) {
        if (!validURL(websites[i].jsCode)) {
          mustUpdate = true;
          updateWebsitesFromRepository(function () {
            amrcsql.webdb.getWebsites(function (list) {
              var websites = list;
              if (websites !== undefined && websites !== null && websites.length > 0) {
                callback(websites);
              }
              else {
                console.error('Huge error...');
              }
            });
          });

          break;
        }
      }
      if (!mustUpdate) {
        callback(websites);
      }
    }
    else {
      // First load of websites
      $.ajax({
        url : AMRC_REPOSITORY + 'websites.json',
        success : function (resp) {
          var ws = resp;
          var i;

          for (i = 0; i < ws.length; i += 1) {
            console.log('Load JS from repository for ' + ws[i].mirrorName);
            loadJSFromRepository(ws[i]);
          }
          waitForFinishRepository(ws, callback);
        },
        error : function () {
          callback([]);
        }
      });
    }
  });
}

function loadJSFromRepository (description) {
  // New way (CSP with manifest 2) --> store link to js on https to include when needed...
  description.jsCode = AMRC_REPOSITORY + description.jsFile;
  console.log('insert or update ' + description.mirrorName + ' in database');

  amrcsql.webdb.storeWebsite(description, function () {
    description.loaded = true;
  });
}

function waitForFinishRepository (websites, callback) {
  chrome.extension.getBackgroundPage().isReady(false, 'Waiting for mirrors to be loaded');
  var done = true;
  var i;

  for (i = 0; i < websites.length; i += 1) {
    if (!websites[i].loaded || websites[i].loaded === false) {
      done = false;
      break;
    }
  }

  if (done) {
    console.log('All websites loaded');
    callback(websites);
    chrome.extension.getBackgroundPage().isReady(true);
  }
  else {
    setTimeout(function () {
      waitForFinishRepository(websites, callback);
    }, 100);
  }
}

// ##############################################################################
// Update websites database from repository
// ##############################################################################

function waitForFinishUpdatingRepository (changes, callback) {
  var done = true;
  var i;

  for (i = 0; i < changes.length; i += 1) {
    if (!changes[i].loaded || changes[i].loaded === false) {
      done = false;
      break;
    }
  }

  if (done) {
    console.log('All websites updated successfully');
    callback();
  }
  else {
    setTimeout(waitForFinishUpdatingRepository.bind(null, changes, callback), 100);
  }
}

function updateWebsitesFromRepository (callback) {
  $.ajax({
     type: 'GET',
     url: AMRC_REPOSITORY + 'websites.json',
     error: function () {
       AMRC_REPOSITORY = AMRC_REPOSITORY_BACKUP;
     }
  });

  $.ajax({
    url : AMRC_REPOSITORY + 'websites.json?1',

    beforeSend : function (xhr) {
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('Pragma', 'no-cache');
    },

    success : function (resp) {
      // distant descriptions
      var wsdist = resp;
      // local description
      amrcsql.webdb.getWebsites(function (list) {
        var wsloc = list;

        if (wsloc !== undefined && wsloc !== null && wsloc.length > 0) {
          // Compare loc and dist...
          // Check revision
          var changes = [];
          var i;
          var j;
          var found;
          var change;

          for (i = 0; i < wsdist.length; i += 1) {
            found = false;

            for (j = 0; j < wsloc.length; j += 1) {
              if (wsdist[i].mirrorName === wsloc[j].mirrorName) {
                change = {
                  description : wsdist[i],
                  type : 'update'
                };

                if (!validURL(wsloc[j].jsCode)) {
                  // object correspond to old description (js code in database... switch to manifest 2)
                  console.log('Website ' + wsdist[i].mirrorName + ' has an old description... swintch to new one...');

                  change.nonotif = true;
                  updateJSFromRepository(wsdist[i], change);
                  changes[changes.length] = change;
                }
                else {
                  if (wsloc[j].revision !== 0 && wsloc[j].revision < wsdist[i].revision) {
                    // Website has been updated...
                    console.log('Website has been updated ' + wsdist[i].mirrorName);

                    updateJSFromRepository(wsdist[i], change);
                    changes[changes.length] = change;
                  }
                  /*else if (wsloc[j].revision === 0) {
                    // Temporary implementation locally for this website
                    // Do nothing...
                  }*/
                }

                found = true;
              }
            }
            if (!found) {
              // Check for new ones
              // Website is new...
              console.log('Website has been created ' + wsdist[i].mirrorName);
              change = {
                description : wsdist[i],
                type : 'create'
              };
              updateJSFromRepository(wsdist[i], change);
              changes[changes.length] = change;
            }
          }

          // Check for deletion ?? --> not yet --> can't delete websites yet on AMRC.

          // If changes --> Reload implementations...
          if (changes.length > 0) {
            waitForFinishUpdatingRepository(changes, function () {
              callback();
            });
          }
          else {
            callback();
          }
        }
        else {
          console.log('Error --> No local websites ?? Reload the extension... !');
          callback();
        }
      });
    },

    error : function () {
      console.log('Error while updating websites repository. --> Repository not reachable...');
      callback();
    }
  });
}

function updateJSFromRepository (description, change) {
  description.jsCode = AMRC_REPOSITORY + description.jsFile;

  var isNew = false;

  if (change.type === 'create') {
    console.log('insert ' + description.mirrorName + ' in database');

    amrcsql.webdb.storeWebsite(description, function () {
      change.loaded = true;
    });

    isNew = true;
  }
  else if (change.type === 'update') {
    console.log('update ' + description.mirrorName + ' in database');

    amrcsql.webdb.updateWebsite(description, function () {
      change.loaded = true;
    });
  }
  // Notification
  var params = getParameters();

  if (params.shownotifws === 1 && (change.nonotif === undefined || !change.nonotif)) {
    var wsData = {
      ws : description.mirrorName,
      developer : description.developer,
      revision : description.revision,
      idext : description.id,
      isnew : isNew
    };

    displayNotification(wsData, params);
  }
}

// ##############################################################################
// Functions to import non released versions of websites
// ##############################################################################

function finishImportAfterInsert (description, callback, isNew) {
  // Notification
  var params = getParameters();

  if (params.shownotifws === 1) {
    var wsData = {
      ws : description.mirrorName,
      developer : description.developer,
      revision : description.revision,
      idext : description.id,
      isnew : isNew
    };
    displayNotification(wsData, params);
  }
  callback(description.mirrorName);
}

function importImplentationFromId (id, callback) {
  $.ajax({
    url : AMRC_ROOT + 'service.php?name=implementation_get_v2&id=' + id,

    beforeSend : function (xhr) {
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('Pragma', 'no-cache');
    },

    success : function (resp) {
      // distant description
      var description = JSON.parse(resp);

      // local description
      getMirrorsDescription(function (list) {
        var wsloc = list;
        if (wsloc !== undefined && wsloc !== null && wsloc.length > 0) {
          var found = null;
          var j;

          for (j = 0; j < wsloc.length; j += 1) {
            if (description.mirrorName === wsloc[j].mirrorName) {
              found = wsloc[j];
              break;
            }
          }

          console.log('description loaded for ' + description.mirrorName);

          var isNew = false;
          description.revision = 0;
          description.jsCode = AMRC_ROOT + description.jsFile;

          if (found === null) {
            // Ajout de l'implem
            console.log('insert ' + description.mirrorName + ' in database');

            isNew = true;

            amrcsql.webdb.storeWebsite(description, function () {
              finishImportAfterInsert(description, callback, isNew);
            });
          }
          else {
            // Mise ? jour de l'implem
            console.log('update ' + description.mirrorName + ' in database');

            amrcsql.webdb.updateWebsite(description, function () {
              finishImportAfterInsert(description, callback, isNew);
            });
          }
        }
        else {
          console.log('Error --> No local websites ?? Reload the extension... !');
          callback();
        }
      });
    },

    error : function () {
      console.log('Error while importing an implementation from repository. --> Repository not reachable...');
      callback();
    }
  });
}

function releaseImplentationFromId (id, callback) {
  $.ajax({
    url : AMRC_ROOT + 'service.php?name=implementation_getrelease_v2&id=' + id,

    beforeSend : function (xhr) {
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('Pragma', 'no-cache');
    },

    success : function (resp) {
      // distant description
      var description = JSON.parse(resp);

      // local description
      getMirrorsDescription(function (list) {
        var wsloc = list;

        if (wsloc && wsloc.length > 0) {
          var found = null;
          var j;

          for (j = 0; j < wsloc.length; j += 1) {
            if (description.mirrorName === wsloc[j].mirrorName) {
              found = wsloc[j];
              break;
            }
          }

          console.log('description loaded for ' + description.mirrorName);

          description.jsCode = AMRC_REPOSITORY + description.jsFile;

          var isNew = false;

          if (found === null) {
            // Ajout de l'implem
            console.log('insert ' + description.mirrorName + ' in database');

            isNew = true;

            amrcsql.webdb.storeWebsite(description, function () {
              callback(description.mirrorName);
            });
          }
          else {
            // Mise ? jour de l'implem
            console.log('update ' + description.mirrorName + ' in database');

            amrcsql.webdb.updateWebsite(description, function () {
              callback(description.mirrorName);
            });
          }

          // Notification
          var params = getParameters();

          if (params.shownotifws === 1) {
            var wsData = {
              ws : description.mirrorName,
              developer : description.developer,
              revision : description.revision,
              idext : description.id,
              isnew : isNew
            };

            displayNotification(wsData, params);
          }
        }
        else {
          console.log('Error --> No local websites ?? Reload the extension... !');
          callback();
        }
      });
    },

    error : function () {
      console.log('Error while importing an implementation from repository. --> Repository not reachable...');
      callback();
    }
  });
}
// ##############################################################################
// Functions to get websites...
// ##############################################################################
// Returns mirror descriptions...

function getFilledMirrorsDesc (activatedMirrors, callback) {
  getMirrorsDescription(function (list) {
    var wsloc = list;
    var filledMD = [];
    var i;
    var j;

    for (i = 0; i < wsloc.length; i += 1) {
      for (j = 0; j < activatedMirrors.length; j += 1) {
        if (activatedMirrors[j].mirror === wsloc[i].mirrorName) {
          filledMD[filledMD.length] = wsloc[i];
          break;
        }
      }
    }

    callback(filledMD);
  });
}

// Temporary implementations loaded
var loadedImplementations = [];

// This method is called by the last line of implementations 2.0 which pass the object (as we can't eval it...)
function registerMangaObject (mirrorName, object) {
  loadedImplementations[mirrorName] = object;
}

// Instantiate a returned mirror and load the script...
function loadJSFromRepositoryForMirrors (list, pos, input) {
  var docache = true;

  if (input.jsCode.indexOf('.php') !== -1) {
    docache = false;
  }

  $.loadScript(input.jsCode, docache, function () {
    list[pos] = loadedImplementations[input.mirrorName];

    if (typeof list[pos] === 'undefined') {
      list[pos] = {};
      list[pos].error = 'Script ' + input.mirrorName + ' failed to be loaded... Error compiling JS code... Link : ' + input.jsCode;

      console.log('Error compiling JS code: ' + input.jsCode);
    }
    else {
      console.log('Script ' + list[pos].mirrorName + ' loaded and executed.');
    }

    list[pos].mirrorName = input.mirrorName;
    list[pos].mirrorIcon = input.mirrorIcon;
    list[pos].revision = input.revision;
    list[pos].developer = input.developer;
    list[pos].idext = input.idext;
    list[pos].loadedscript = true;
  }, function () {
    // error managing
    console.log('Script ' + input.mirrorName + ' failed to be loaded...');
    console.log(input);

    list[pos] = {
      loadedscript : true,
      error : 'Script ' + input.mirrorName + ' failed to be loaded...'
    };
  });
}

// Wait for all mirrors to be loaded
function waitForFinishgetMirrors (mirrors, callback) {
  var done = true;
  var i;

  for (i = 0; i < mirrors.length; i += 1) {
    if (!mirrors[i].loadedscript || mirrors[i].loadedscript === false) {
      done = false;
      break;
    }
  }

  if (done) {
    callback(mirrors);
    chrome.extension.getBackgroundPage().isReady(true);
  }
  else {
    setTimeout(waitForFinishgetMirrors.bind(null, mirrors, callback), 100);
  }
}

// Returns mirror with implementation
function getMirrors (callback) {
  chrome.extension.getBackgroundPage().isReady(false, 'Downloading mirrors from repository');

  getMirrorsDescription(function (list) {
    var wsloc = list;
    var mirrorsTmp = [];

    wsloc.forEach(function (ws) {
      var cur = mirrorsTmp.length;

      mirrorsTmp[cur] = {}; // Keep this place for the object...
      loadJSFromRepositoryForMirrors(mirrorsTmp, cur, ws);
    });

    chrome.extension.getBackgroundPage().isReady(true);

    waitForFinishgetMirrors(mirrorsTmp, function () {
      callback(mirrorsTmp);
    });
  });
}

function doesCurrentPageMatchManga (url, activatedMirrors, callback) {
  getMirrorsDescription(function (list) {
    var wsloc = list;
    var isok = false;
    var i;

    for (i = 0; i < wsloc.length; i += 1) {
      var isFound = false;
      var j;

      for (j = 0; j < activatedMirrors.length; j += 1) {
        if (activatedMirrors[j].mirror === wsloc[i].mirrorName) {
          isFound = true;
          break;
        }
      }

      if (isFound) {
        var wss = (typeof wsloc[i].webSites === 'object') ? wsloc[i].webSites : JSON.parse(wsloc[i].webSites);

        for (j = 0; j < wss.length; j += 1) {
          // console.log(wss[j] + ' --> ' + url);

          if (url.match(wss[j].replace(/\./g, '\\.').replace(/\*/g, '.*'))) {
            callback(true, wsloc[i].mirrorName, wsloc[i].jsCode);
            isok = true;
            return;
          }
        }
      }
    }

    if (!isok) {
      callback(false, '', null);
    }
  });
}

// Instantiate a returned activated mirror and load the script...
function loadJSFromRepositoryForActivatedMirrors (list, pos, input) {
  chrome.extension.getBackgroundPage().isReady(false, 'Downloading activated mirrors from repository');

  var docache = true;

  if (input.jsCode.indexOf('.php') !== -1) {
    docache = false;
  }

  $.loadScript(input.jsCode, docache, function () {
    list[pos] = loadedImplementations[input.mirrorName];

    if (list[pos] !== undefined) {
      list[pos].mirrorName = input.mirrorName;
      list[pos].mirrorIcon = input.mirrorIcon;
      list[pos].revision = input.revision;
      list[pos].developer = input.developer;
      list[pos].idext = input.idext;
      list[pos].listLoaded = false;

      if (list[pos].canListFullMangas) {
        wssql.webdb.getMangaList(list[pos].mirrorName, function (listMgs) {
          list[pos].listmgs = listMgs;
          list[pos].listLoaded = true;
        });
      }
      else {
        list[pos].listLoaded = true;
      }

      console.log('Script ' + list[pos].mirrorName + ' loaded and executed.');

      list[pos].loadedscript = true;
    }
    else {
      console.log('Script ' + input.mirrorName + ' failed to be loaded... Error while compiling JS code... Link : ' + input.jsCode);

      list[pos] = {
        loadedscript : true,
        listLoaded : true,
        error : 'Script ' + input.mirrorName + ' failed to be loaded... Error while compiling JS code... Link : ' + input.jsCode
      };
    }
  }, function () {
    // error managing
    console.log('Script ' + input.mirrorName + ' failed to be loaded...');
    console.log(input);
    list[pos] = {
      loadedscript : true,
      listLoaded : true,
      error : 'Script ' + input.mirrorName + ' failed to be loaded...'
    };
  });
  chrome.extension.getBackgroundPage().isReady(true)
}

function waitForActivatedAndListFinish (mirrorsT, callback) {
  var fin = true;
  var i;

  for (i = 0; i < mirrorsT.length; i += 1) {
    if (!mirrorsT[i].listLoaded || mirrorsT[i].loadedscript === null || !mirrorsT[i].loadedscript) {
      fin = false;
    }
  }

  if (fin) {
    callback(mirrorsT);
  }
  else {
    setTimeout(waitForActivatedAndListFinish.bind(null, mirrorsT, callback), 100);
  }
}

function getActivatedMirrorsWithList (res, callback) {
  getMirrorsDescription(function (listws) {
    var wsloc = listws;
    var mirrorsTmp = [];
    var lstAc = res.list;
    var i;
    var j;

    for (i = 0; i < wsloc.length; i += 1) {
      for (j = 0; j < lstAc.length; j += 1) {
        if (lstAc[j].mirror === wsloc[i].mirrorName) {
          var cur = mirrorsTmp.length;

          mirrorsTmp[cur] = {}; // Keep the place for the object...
          loadJSFromRepositoryForActivatedMirrors(mirrorsTmp, cur, wsloc[i]);

          break;
        }
      }
    }

    waitForActivatedAndListFinish(mirrorsTmp, callback);
  });
}

function getActivatedMirrors (callback) {
  chrome.runtime.sendMessage({
    action : 'activatedMirrors'
  }, function (res) {
    getActivatedMirrorsWithList(res, callback);
  });
}
