/*globals getMangaMirror, saveList*/

/* Object manga */
XMLHttpRequest.prototype.mangaEltRef = null;
XMLHttpRequest.prototype.extensionRef = null;
HTMLLinkElement.prototype.mangaEltRef = null;
HTMLLinkElement.prototype.divDelete = null;
HTMLLinkElement.prototype.divNormal = null;
HTMLLinkElement.prototype.mirror = null;
HTMLInputElement.prototype.mirror = null;

Array.prototype.remove = function (from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function MangaElt (obj) {
  this.mirror = obj.mirror;
  this.name = obj.name;
  this.url = obj.url;
  this.lastChapterReadURL = obj.lastChapterReadURL || null;
  this.lastChapterReadName = obj.lastChapterReadName || null;
  this.listChaps = [];

  if (obj.listChaps) {
    this.listChaps = JSON.parse(obj.listChaps);
  }

  this.read = obj.read || 0;
  this.update = obj.update || 1;
  this.display = obj.display || 0;
  this.cats = obj.cats || [];

  if (obj.cats) {
    this.cats = JSON.parse(obj.cats);
  }

  this.ts = obj.ts || Math.round((new Date()).getTime() / 1000);
  this.upts = obj.upts || 0;
}

MangaElt.prototype.consult = function (obj, fromSite) {
  if (fromSite === undefined) {
    fromSite = false;
  }

  var posOld = -1;
  var posNew = -1;
  var i = -1;
  var length = this.listChaps.length;
  var list;

  while (++i < length) {
    list = this.listChaps[i][1];

    if (list === this.lastChapterReadURL) {
      posOld = i;
    }
    if (list === obj.lastChapterReadURL) {
      posNew = i;
    }
  }

  if (posNew === -1) {
    // New chapter is not in chapters list --> Reload chapter list
    if (getMangaMirror(this.mirror) !== null && this.update === 1) {
      getMangaMirror(this.mirror).getListChaps(this.url, this.name, this, function (lst, obj2) {
        if (lst.length > 0) {
          obj2.listChaps = lst;
          for (i = 0; i < lst.length; i += 1) {
            if (lst[i][1] === obj2.lastChapterReadURL) {
              posOld = i;
            }
            if (lst[i][1] === obj.lastChapterReadURL) {
              posNew = i;
            }
          }

          if (posNew !== -1) {
            if (fromSite || (posNew < posOld || posOld === -1)) {
              obj2.lastChapterReadURL = obj.lastChapterReadURL;
              obj2.lastChapterReadName = obj.lastChapterReadName;
              if (!fromSite) {
                obj2.ts = Math.round((new Date()).getTime() / 1000);
              }
            }
          }
          saveList();
        }
      });
    }
  }
  else {
    if (fromSite || (posNew < posOld || posOld === -1)) {
      this.lastChapterReadURL = obj.lastChapterReadURL;
      this.lastChapterReadName = obj.lastChapterReadName;
      if (!fromSite) {
        this.ts = Math.round((new Date()).getTime() / 1000);
      }
    }
  }

  // if the current manga doesnt have a name, and the request does, then we fix the current name
  if (this.name === '' && obj.name !== this.name) {
    this.name = obj.name;
  }

  // This happens when incoming updates comes from sync
  // if obj.display, obj.read, obj.cats, MAJ this....
  if (obj.display) {
    this.display = obj.display;
  }
  if (obj.read) {
    this.read = obj.read;
  }
  if (obj.update) {
    this.update = obj.update;
  }
  if (obj.cats !== undefined && obj.cats !== null) {
    this.cats = JSON.parse(obj.cats) || obj.cats || [];
  }
  if (obj.ts && fromSite) {
    this.ts = obj.ts;
  }
};

MangaElt.prototype.refreshLast = function (doSave, callback) {
  if (this.update === 1) {
    // Refresh the last existing chapter of this manga
    if (!doSave) {
      doSave = true;
    }

    var self = this;
    var hasBeenTimeout = false;

    var timeOutRefresh = setTimeout(function () {
      hasBeenTimeout = true;
      console.log('Refreshing ' + self.url + ' has been timeout... seems unreachable...');
      if (callback !== undefined && typeof callback === 'function') {
        callback(self);
      }
    }, 60000);

    setTimeout(function () {
      if (getMangaMirror(self.mirror) !== null) {
        getMangaMirror(self.mirror).getListChaps(self.url, self.name, self, function (lst, obj) {
          clearTimeout(timeOutRefresh);
          if (lst.length > 0) {
            var parameters = JSON.parse(localStorage.parameters);
            var oldLastChap = (typeof obj.listChaps[0] === 'object' ? obj.listChaps[0][1] : undefined);
            var newLastChap;
            var urls;
            var mangaData;

            obj.listChaps = lst;
            newLastChap = obj.listChaps[0][1];
            // if oldLastChap === undefined --> new manga added --> no notifications (Issue #40)
            if ((newLastChap !== oldLastChap) && (oldLastChap !== undefined)) {
              if (obj.read === 0 && (parameters.shownotifications === 1)) {
                urls = $.map(obj.listChaps, function (chap) {
                  return chap[1];
                });

                mangaData = {
                  name: obj.name,
                  mirror: obj.mirror,
                  url: urls[urls.indexOf(obj.lastChapterReadURL) - 1]
                };
                // Notification data added to variables to be used by the old or by the new notification API.
                var description = '... has new chapter(s) on ' + mangaData.mirror + '! Click anywhere to open the next unread chapter.';
                var title = mangaData.name;
                var icon = chrome.extension.getURL('../img/icon-32.png');
                var url = mangaData.url;
                if (chrome.notifications) {
                  // The new API have no notification object, so can't save data on it.
                  // Hence, the URL must be saved under a global object, mapped by ID.
                  // (no one would like to click a manga notification and ending up opening another manga)
                  // For now, those global data is being saved here. But I think it would be better
                  // to move it to another place for the sake of better code organization.
                  // And because there are other notifications being opened elsewhere in the code too.
                  if (self.notifications === undefined) {
                    self.notifications = {};
                  }
                  if (self.lastNotificationID === undefined) {
                    self.lastNotificationID = 1;
                  }
                  else {
                    // lastNotificationID can, if the browser is open a sufficient amount of time
                    // and a lot of new manga chapters are found, grow beyond the number upper limit.
                    // But this is so unlikely to happen...
                    self.lastNotificationID++;
                  }

                  self.notifications['amr' + self.lastNotificationID] = url;

                  // Callback function to notification click.
                  function notificationClickCallback (id) {
                    if (self.notifications[id] !== undefined) {
                      chrome.tabs.create({
                        url : self.notifications[id]
                      });
                      // It deletes the used URL to avoid unbounded object growing.
                      // Well, if the notification isn't clicked the said growing is not avoided.
                      // If this proves to be a issue a close callback should be added too.
                      delete self.notifications[id];
                    }
                  }

                  var notificationOptions = {
                    type: 'basic',
                    title: title,
                    message: description,
                    iconUrl: icon
                  };
                  // Add the callback to ALL notifications opened by AMR.
                  // This can sure be a issue with another notifications AMR opens.
                  chrome.notifications.onClicked.addListener(notificationClickCallback);
                  // And finally opens de notification. The third parameter is a creation callback,
                  // which I think is not needed here.
                  chrome.notifications.create('amr' + self.lastNotificationID, notificationOptions, function () {});
                }
              }

              // Set upts to now (means : 'last time we found a new chapter is now');
              obj.upts = new Date().getTime();
            }
            if (obj.lastChapterReadURL === null) {
              obj.lastChapterReadURL = lst[lst.length - 1][1];
              obj.lastChapterReadName = lst[lst.length - 1][0];
              obj.ts = Math.round((new Date()).getTime() / 1000);
            }
            if (doSave || hasBeenTimeout) {
              saveList();
            }
          }

          if (callback !== undefined && typeof callback === 'function' && !hasBeenTimeout) {
            callback(obj);
          }
        });
      }
    }, 10);
  }
  else {
    callback(this);
  }
};
