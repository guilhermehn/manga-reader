// This code will be changed for the storage.sync call of Chrome.

function eachSync (obj, fn, context) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key) && !(key === 'extend' && typeof obj[key] === 'function')) {
      fn.call(context, obj[key], key);
    }
  }
}

function BSync (OPT) {
  this.options = {};

  this.initialize(OPT);

  return this;
}

BSync.prototype.initialize = function (options) {
  var self = this;

  this.setOptions(options);

  if (!this.options.parent) {
    // Get default bookmarks folders
    chrome.bookmarks.getChildren('0', function (bookmarks) {
      // Get the 'Other bookmarks' folder
      // and store it's id
      self.options.parent = bookmarks[1].id;
    });
  }

  return this;
};

BSync.prototype.attach = function () {
  var _1e = this;

  if (this.isAttached) {
    return this;
  }

  if (!this.options.name) {
    this.options.name = 'All Mangas Reader';
    this.options.debug = false;
    this.options.deleteOther = true;
    this.options.folder = 'BSync';
    this.options.idleInterval = 30000;
    this.options.interval = 300000;
    this.options.networkTimeout = 3000;
    this.options.newLine = ' ';
    this.options.testNetwork = false;
    this.attach();
    return this;
  }

  this.isAttached = true;

  if (!this.options.name || !this.options.folder) {
    throw ('No name (name or folder) given, bailing out');
  }

  /*if (!this.options.debug && parseInt(this.options.interval) < 120 * 1000) {
    this.options.interval = 120 * 1000
  }*/
  setTimeout(function () {
    _1e.traverse();
  }, 10000);

  chrome.bookmarks.onCreated.addListener(function (id, _21) {
    var ts;
    if (_21.url && _1e.folder && _1e.folder.id === _21.parentId && (ts = _1e.isValidBookmark(_21))) {
      (function () {
        if (_1e.bookmark && (parseInt(_1e.syncedAt) !== parseInt(ts)) && (_1e.bookmark.id !== _21.id)) {
          if (_1e.options.debug) {
            console.log('REMOVING AND PROCEESSING ON CREATED');
          }

          _1e.stop();
          _21.syncedAt = ts;
          _1e.process(_21, true);
          _1e.start();
        }
        else {
          return false;
        }
      }).delay(800, this);
    }
  });

  chrome.bookmarks.onRemoved.addListener(function (id, _24) {
    if (_1e.options.debug && typeof _24.url === 'undefined') {
      console.log('onRemoved self.folder.id:' + _1e.folder.id + ', id: ' + id + ' title:' + _24.title);
    }

    if (_1e.folder && (id === _1e.folder.id)) {
      _1e.folder = null;
    }
  });

  return this;
};

BSync.prototype.testNetwork = function () {
  var xhr = new XMLHttpRequest(),
    _26 = this;
  var _27 = setTimeout(function () {
      _26.error('NO_NETWORK');
      return this;
    }, this.options.networkTimeout);

  xhr.open('GET', 'http://www.google.com/favicon.ico', true);
  xhr.send();

  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        var s;
        clearTimeout(_27);
        _27 = null;
        if (xhr.responseText.length > 100) {
          _26.traverse(true);
        }
      }
    };
  return this;
};

BSync.prototype.getFolder = function () {
  var _28 = this;
  if (this.folder) {
    return this.folder;
  }

  var _29;
  var _2a = [];
  var _2b = [];

  chrome.bookmarks.getChildren(this.options.parent.toString(), function (_2c) {
    var ts = 0;

    _2c.forEach(function (_2e, _2f) {
      if (_2e.title.match(new RegExp('^.+?\\.' + '([0-9]{10,}?)$'))) {
        _2a.push(_2e);
      }

      if (_2e.title === _28.options.folder && _2e.url === undefined) {
        //console.log('Bookmark : ' + _2e.title + ' date : ' + _2e.dateAdded + ' ; curTS : ' + ts);
        if (_2e.dateAdded > ts) {
          _29 = _2e;
          ts = _2e.dateAdded;
        }

        _2b.push(_2e);

        return this;
      }
    });

    if (!_29) {
      _29 = chrome.bookmarks.create({
        'parentId': _28.options.parent.toString(),
        'title': _28.options.folder
      });
    }
    else {
      _2b.forEach(function (f, _31) {
        if (f.id !== _29.id) {
          chrome.bookmarks.removeTree(f.id);
        }
      });
    }

    if (_29 && _2a) {
      _2a.forEach(function (_32, _33) {
        chrome.bookmarks.move(_32.id, {
          'parentId': _29.id.toString()
        });
      });
    }

    _28.folder = _29;
    _28.traverse(true);
  });

  return false;
};

BSync.prototype.traverse = function (_34) {
  var self = this;
  var _36 = [];
  var _37;
  var _38;
  var _39 = this.folder;
  var _3a;

  if (!_34 && this.options.testNetwork && !this.folder) {
    return this.testNetwork();
  }

  if (this.lastTraversed) {
    this.options.debug && console.log('TRAVERSED DIFF : ' + ((new Date().getTime() - this.lastTraversed) / 1000));
    this.lastTraversed = new Date().getTime();
  }
  else {
    this.lastTraversed = new Date().getTime();
  }

  if (this.options.getUpdate && this.options.getUpdate() && this.syncedAt) {
    if ((new Date().getTime() - this.options.getUpdate()) < this.options.idleInterval) {
      // console.log('WAITING FOR ' + this.idleInterval + ' TO GET UN-IDLE');
      setTimeout(function () {
        self.traverse();
      }, this.options.idleInterval * 2);
      return this;
    }
  }

  if (!_39) {
    return this.getFolder();
  }

  chrome.bookmarks.getChildren(_39.id.toString(), function (_3b) {
    var _3c = 0;
    var ts;

    _3b.forEach(function (_3e, _3f) {
      //console.log('Bookmark : ' + _3b.title);
      if (ts = self.isValidBookmark(_3e)) {
        //console.log('Bookmark : ' + _3b.title + ' date : ' + ts + ' ; curTS : ' + _3c);
        if (self.options.deleteOther) {
          _36.push(_3e)
        }
        if (_3e.url.indexOf('void') !== -1 && (ts > _3c)) {
          _37 = _3e;
          _37.syncedAt = ts;
          _3c = ts;
        }
      }
    });

    if (!_37) {
      if (self.options.debug) {
        console.log('NO BOOKMARK FOUND > WRITING');
      }

      self.options.onWrite();
      //return self.options.onError('MISSING BOOKMARK')
      //
      if (self.options.debug) {
        console.log('BSYNC ERROR : MISSING BOOKMARK');
      }

      return;
    }

    if (self.options.deleteOther) {
      _36.forEach(function (b, i) {
        if (String(b.id) !== String(_37.id)) {
          try {
            chrome.bookmarks.remove(String(b.id));
          }
          catch (ex) {}
        }
      });
    }

    self.synced = _37.syncedAt;
    self.bookmark = self.bookmark || _37;
    return self.process(_37);
  });

  return this.start();
};

BSync.prototype.process = function (bookmarkData, _43) {
  var content;
  var self = this;

  if (!(content = this.getJSON(bookmarkData))) {
    self.options.debug && console.log(' NO CONTENT FOUND > WRITING');
    this.options.onWrite();
    // return this.options.onError('NO CONTENT')
    console.log('BSYNC ERROR : '+' NO CONTENT');
    return;
  }

  this.content = content;

  var syncedAt = this.syncedAt;

  this.syncedAt = bookmarkData.syncedAt;

  if (0) {
    if (this.shouldRead()) {
      this.syncedAtPrevious = syncedAt;
      this.markTimestamp();
      this.bookmark = bookmarkData;
      this.options.onRead(content, bookmarkData);
    }
    else {
      if (this.shouldWrite()) {
        this.options.onWrite(content, bookmarkData);
      }
      else {
        self.options.debug && console.log(' NOTHING TO DO :) ');
      }
    }
  }
  else {
    if (!_43 && this.shouldWrite()) {
      self.options.debug && console.log('\nAbout to write');
      this.options.onWrite(content, bookmarkData);
    }
    else {
      if (this.shouldRead()) {
        self.options.debug && console.log('\nAbout to read');
        this.syncedAtPrevious = this.syncedAt;
        this.markTimestamp();
        this.bookmark = bookmarkData;
        this.options.onRead(content, bookmarkData);
      }
      else {
        self.options.debug && console.log(' NOTHING TO DO :) ');
      }
    }
  }
  return this;
};

BSync.prototype.shouldRead = function () {
  if (this.options.debug) {
    console.log('\n\nChecking shouldRead()');
    console.log('this.syncedAtPrevious: ' + this.syncedAtPrevious);
    console.log('this.syncedAt: ' + this.syncedAt);
    console.log('his.options.getUpdate(): ' + this.options.getUpdate());
  }

  return this.options.getUpdate() === undefined || (this.content && this.syncedAt > this.options.getUpdate());
};

BSync.prototype.shouldWrite = function () {
  if (this.options.debug) {
    console.log('\n\nChecking shouldWrite()');
    console.log('this.syncedAtPrevious: ' + this.syncedAtPrevious);
    console.log('this.syncedAt: ' + this.syncedAt);
    console.log('his.options.getUpdate(); ' + this.options.getUpdate());
  }

  return !this.content || (this.options.getUpdate() && (this.options.getUpdate() > this.syncedAt));
};

BSync.prototype.write = function (_47) {
  var _48 = this;
  if (this.content && JSON.stringify(this.content) === JSON.stringify(_47)) {
    if (_48.options.debug) {
      console.log('SORRY SAME CONTENT / BAILING OUT');
    }

    return false;
  }

  if (this.bookmark && this.bookmark.id) {
    try {
      chrome.bookmarks.remove(String(this.bookmark.id));
    }
    catch (ex) {}
  }

  this.syncedAtPrevious = this.syncedAt;
  this.syncedAt = this.options.getUpdate() || new Date().getTime();
  //console.log('resultat de getUpdate: ' + this.options.getUpdate());

  var _49 = function (obj) {
    eachSync(obj, function (_4b, key) {
      if (_4b && _4b.toLowerCase && _4b.toLowerCase()) {
        obj[key] === _4b//.replace(new RegExp('(' + String.fromCharCode(10) + '|' + String.fromCharCode(13) + ')', 'g'), _48.options.newLine)
      }
    });
    return obj;
  };

  //console.log('To write : ' + $H(_47).toJSON());
  _47 = _49(_47);

  //console.log('To write after each : ' + $H(_47).toJSON());
  //console.log('Written in bookmark : ' + JSON.stringify(_47));
  //
  chrome.bookmarks.create({
    parentId: this.folder.id.toString(),
    title: this.options.name + '.' + this.syncedAt,
    url: 'javascript:void("' + JSON.stringify(_47) + '");void(' + (Math.random() * 1000) + ');'
  }, function (_4d) {
    _48.bookmark = _4d;
  });

  _48.options.debug && console.log('\nWROTE > ' + JSON.stringify(_47));
  this.markTimestamp(true);
  return this;
};

BSync.prototype.start = function () {
  if (!this.isAttached) {
    return this.attach();
  }
  var _4e = this;
  this.timer = setTimeout(function () {
    _4e.traverse();
  }, this.options.interval);
  this.isRunning = true;
  return this;
};

BSync.prototype.stop = function () {
  if (!this.isRunning) {
    return this;
  }
  clearTimeout(this.timer);
  this.timer = null;
  this.isRunning = false;
  return this;
};

BSync.prototype.setOptions = function (_4f) {
  var _50 = this,
    fn, _52;
  for (var i in _4f) {
      if (typeof(_4f[i]) === 'function') {
        this.options[i] = _4f[i].bind(this);
      }
      else {
        this.options[i] = _4f[i];
      }
    }
  return this;
};

BSync.prototype.markTimestamp = function (_54) {
  this['synced' + (_54 ? 'To' : 'From')] = new Date().getTime();
  return this;
};

BSync.prototype.getJSON = function (_55) {
  var url = _55.url;
  var json = '';
  url = url.replace(/^.*?void\('(.*?)'\);void.*?$/, '$1');

  // url = url.replace(new RegExp(this.options.newLine, 'g'), String.fromCharCode(10));
  // console.log('JSON to parse : ' + url);

  if (url) {
    try {
      json = JSON.parse(url);
    }
    catch (ex) {
      // console.log('Erreur de parsing JSON -->''');
      json = '';
    }
  }

  return json;
};

BSync.prototype.isValidBookmark = function (_59) {
  var _5a;

  if (!_59) {
    return false;
  }

  if (!(_5a = _59.title.match(new RegExp('^' + this.options.name + '\\.' + '([0-9]{10,}?)$')))) {
    return false;
  }

  _59.syncedAt = _5a[1];

  return parseInt(_5a[1]);
};
