/*globals wssql, amrcsql, getParameters*/

/*var AMRC_REPOSITORY = 'https://ssl10.ovh.net/~allmanga/community/latest_v2/';
var AMRC_ROOT = 'https://ssl10.ovh.net/~allmanga/community/';
var AMRC_REPOSITORY_BACKUP = 'https://raw.github.com/AllMangasReader-dev/mirrors/master/';*/

var AMRC_REPOSITORY = 'https://ssl10.ovh.net/~allmanga/community/latest_v2/';
var AMRC_ROOT = 'https://ssl10.ovh.net/~allmanga/community/';
var AMRC_REPOSITORY_BACKUP = 'https://raw.github.com/guilhermehn/mirrors/master/';

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
  var notif = window.webkitNotifications.createNotification(chrome.extension.getURL('../img/icon-32.png'), wsData.ws, text);
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
    let websites = list;
    let mustUpdate = false;

    if (!!websites && websites.length > 0) {
      // For compatibility, check if websites jsCode is a url and not an implementation
      for (let i = 0; i < websites.length; i += 1) {
        if (!validURL(websites[i].jsCode)) {
          mustUpdate = true;

          updateWebsitesFromRepository(() => {
            amrcsql.webdb.getWebsites((list) => {
              let websites = list;

              if (!!websites && websites.length > 0) {
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
        url: `${AMRC_REPOSITORY}websites.json`,
        success : function (mirrors) {
          mirrors.forEach((mirror) => {
            console.log(`Load JS from repository for ${mirror.mirrorName}`);
            loadJSFromRepository(mirror);
          });

          waitForFinishRepository(mirrors, callback);
        },
        error: callback.bind(null, [])
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

  let done = websites.every(website => !!website.loaded);;

  if (done) {
    console.log('All websites loaded');
    callback(websites);
    chrome.extension.getBackgroundPage().isReady(true);
  }
  else {
    setTimeout(() => {
      waitForFinishRepository(websites, callback);
    }, 100);
  }
}

// ##############################################################################
// Update websites database from repository
// ##############################################################################

function waitForFinishUpdatingRepository (changes, callback) {
  let done = changes.every(item => !!item.loaded);;

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

    beforeSend (xhr) {
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('Pragma', 'no-cache');
    },

    success (resp) {
      // distant descriptions
      var wsdist = resp;
      // local description
      amrcsql.webdb.getWebsites(function (list) {
        var wsloc = list;

        if (wsloc !== undefined && wsloc !== null && wsloc.length > 0) {
          // Compare loc and dist...
          // Check revision
          var changes = [];
          var found;
          var change;

          for (let i = 0; i < wsdist.length; i += 1) {
            found = false;

            for (let j = 0; j < wsloc.length; j += 1) {
              if (wsdist[i].mirrorName === wsloc[j].mirrorName) {
                change = {
                  description: wsdist[i],
                  type: 'update'
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
                description: wsdist[i],
                type: 'create'
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

    error () {
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
  getMirrorsDescription((list) => {
    var filledMD = [];

    for (let i = 0; i < list.length; i += 1) {
      for (let j = 0; j < activatedMirrors.length; j += 1) {
        if (activatedMirrors[j].mirror === list[i].mirrorName) {
          filledMD.push(list[i]);
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
  let shouldCache = input.jsCode.indexOf('.php') === -1;

  $.loadScript(input.jsCode, shouldCache, () => {
    list[pos] = loadedImplementations[input.mirrorName];

    if (typeof list[pos] === 'undefined') {
      list[pos] = {
        error: `Script ${input.mirrorName} failed to be loaded... Error compiling JS code... Link : ${input.jsCode}`
      };

      console.log('Error compiling JS code: ' + input.jsCode);
    }
    else {
      console.log(`Script ${list[pos].mirrorName} loaded and executed.`);
    }

    list[pos].mirrorName = input.mirrorName;
    list[pos].mirrorIcon = input.mirrorIcon;
    list[pos].revision = input.revision;
    list[pos].developer = input.developer;
    list[pos].idext = input.idext;
    list[pos].loadedscript = true;
  }, function () {
    // error managing
    let errorMessage = `Script ${input.mirrorName} failed to be loaded...`;
    console.log(errorMessage);
    console.log(input);

    list[pos] = {
      loadedscript: true,
      error: errorMessage
    };
  });
}

// Wait for all mirrors to be loaded
function waitForFinishgetMirrors (mirrors, callback) {
  let done = mirrors.every(mirror => !!mirror.loadedscript);;

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
  let backgroundPage = chrome.extension.getBackgroundPage();

  backgroundPage.isReady(false, 'Downloading mirrors from repository');

  getMirrorsDescription((list) => {
    let mirrorsTmp = [];

    list.forEach((ws) => {
      let length = mirrorsTmp.length;

      mirrorsTmp[length] = {}; // Keep this place for the object...
      loadJSFromRepositoryForMirrors(mirrorsTmp, length, ws);
    });

    backgroundPage.isReady(true);

    waitForFinishgetMirrors(mirrorsTmp, () => {
      callback(mirrorsTmp);
    });
  });
}

function doesCurrentPageMatchManga (url, activatedMirrors, callback) {
  getMirrorsDescription((wsloc) => {
    var isok = false;

    wsloc.forEach((item) => {
      let isFound = activatedMirrors.some((mirror, i) => {
        return mirror.mirror === item.mirrorName;
      });

      if (isFound) {
        let wss = typeof item.webSites === 'object' ? item.webSites : JSON.parse(item.webSites);

        for (let j = 0; j < wss.length; j += 1) {
          if (url.match(wss[j].replace(/\./g, '\\.').replace(/\*/g, '.*'))) {
            callback(true, item.mirrorName, item.jsCode);
            isok = true;
            return;
          }
        }
      }
    });

    if (!isok) {
      callback(false, '', null);
    }
  });
}

// Instantiate a returned activated mirror and load the script...
function loadJSFromRepositoryForActivatedMirrors (list, pos, input) {
  chrome.extension.getBackgroundPage().isReady(false, 'Downloading activated mirrors from repository');

  let shouldCache = input.jsCode.indexOf('.php') === -1;

  $.loadScript(input.jsCode, shouldCache, function () {
    list[pos] = loadedImplementations[input.mirrorName];

    if (list[pos]) {
      list[pos].mirrorName = input.mirrorName;
      list[pos].mirrorIcon = input.mirrorIcon;
      list[pos].revision = input.revision;
      list[pos].developer = input.developer;
      list[pos].idext = input.idext;
      list[pos].listLoaded = false;

      if (list[pos].canListFullMangas) {
        wssql.webdb.getMangaList(list[pos].mirrorName, (listMgs) => {
          list[pos].listmgs = listMgs;
          list[pos].listLoaded = true;
        });
      }
      else {
        list[pos].listLoaded = true;
      }

      console.log(`Script ${list[pos].mirrorName} loaded and executed.`);

      list[pos].loadedscript = true;
    }
    else {
      let errorMessage = `Script ${input.mirrorName} failed to be loaded. Error while compiling JS code. Link : ${input.jsCode}`;
      console.log(errorMessage);

      list[pos] = {
        loadedscript: true,
        listLoaded: true,
        error: errorMessage
      };
    }
  }, function () {
    // error managing
    let errorMessage = `Script ${input.mirrorName} failed to be loaded.`;

    console.log(errorMessage);
    console.log(input);

    list[pos] = {
      loadedscript: true,
      listLoaded: true,
      error: errorMessage
    };
  });

  chrome.extension.getBackgroundPage().isReady(true);
}

function waitForActivatedAndListFinish (mirrors, callback) {
  let done = mirrors.every(mirror => !!mirror.listLoaded && !!mirror.loadedscript);

  if (done) {
    callback(mirrorsT);
  }
  else {
    setTimeout(waitForActivatedAndListFinish.bind(null, mirrorsT, callback), 100);
  }
}

function getActivatedMirrorsWithList (res, callback) {
  getMirrorsDescription((listws) => {
    let wsloc = listws;
    let mirrorsTmp = [];
    let lstAc = res.list;

    for (let i = 0; i < wsloc.length; i += 1) {
      for (let j = 0; j < lstAc.length; j += 1) {
        if (lstAc[j].mirror === wsloc[i].mirrorName) {
          let cur = mirrorsTmp.length;

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
  }, (res) => getActivatedMirrorsWithList(res, callback));
}
