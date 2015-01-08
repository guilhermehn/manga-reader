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
  var self = this;

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
    self.traverse();
  }, 10000);

  chrome.bookmarks.onCreated.addListener(function (id, bookmark) {
    var ts;
    if (bookmark.url && self.folder && self.folder.id === bookmark.parentId && (ts = self.isValidBookmark(bookmark))) {
      setTimeout(function () {
        if (self.bookmark && (parseInt(self.syncedAt) !== parseInt(ts)) && (self.bookmark.id !== bookmark.id)) {
          if (self.options.debug) {
            console.log('REMOVING AND PROCEESSING ON CREATED');
          }

          self.stop();
          bookmark.syncedAt = ts;
          self.process(bookmark, true);
          self.start();
        }
        else {
          return false;
        }
      }, 800);
    }
  });

  chrome.bookmarks.onRemoved.addListener(function (id, bookmark) {
    if (self.options.debug && typeof bookmark.url === 'undefined') {
      console.log('onRemoved self.folder.id:' + self.folder.id + ', id: ' + id + ' title:' + bookmark.title);
    }

    if (self.folder && (id === self.folder.id)) {
      self.folder = null;
    }
  });

  return this;
};

BSync.prototype.testNetwork = function () {
  var xhr = new XMLHttpRequest();
  var self = this;

  var timeout = setTimeout(function () {
    self.error('NO_NETWORK');
    return this;
  }, this.options.networkTimeout);

  xhr.open('GET', 'http://www.google.com/favicon.ico', true);
  xhr.send();

  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        clearTimeout(timeout);
        timeout = null;
        if (xhr.responseText.length > 100) {
          self.traverse(true);
        }
      }
    };
  return this;
};

BSync.prototype.getFolder = function () {
  if (this.folder) {
    return this.folder;
  }

  var self = this;
  var folder;
  var bookmarks = [];
  var _2b = [];

  chrome.bookmarks.getChildren(this.options.parent.toString(), function (results) {
    var ts = 0;

    results.forEach(function (bookmark) {
      if (bookmark.title.match(new RegExp('^.+?\\.' + '([0-9]{10,}?)$'))) {
        bookmarks.push(bookmark);
      }

      if (bookmark.title === self.options.folder && bookmark.url === undefined) {
        // console.log('Bookmark : ' + bookmark.title + ' date : ' + bookmark.dateAdded + ' ; curTS : ' + ts);
        if (bookmark.dateAdded > ts) {
          folder = bookmark;
          ts = bookmark.dateAdded;
        }

        _2b.push(bookmark);

        return this;
      }
    });

    if (!folder) {
      folder = chrome.bookmarks.create({
        parentId: self.options.parent.toString(),
        title: self.options.folder
      });
    }
    else {
      _2b.forEach(function (bookmark) {
        if (bookmark.id !== folder.id) {
          chrome.bookmarks.removeTree(bookmark.id);
        }
      });
    }

    if (folder && bookmarks) {
      bookmarks.forEach(function (bookmark) {
        chrome.bookmarks.move(bookmark.id, {
          parentId: folder.id.toString()
        });
      });
    }

    self.folder = folder;
    self.traverse(true);
  });

  return false;
};

BSync.prototype.traverse = function (tree) {
  var self = this;
  var bookmarks = [];
  var _37;
  var _38;
  var folder = this.folder;
  var now = new Date().getTime();

  if (!tree && this.options.testNetwork && !this.folder) {
    return this.testNetwork();
  }

  if (this.options.debug && this.lastTraversed) {
    console.log('TRAVERSED DIFF : ' + ((now - this.lastTraversed) / 1000));
  }

  this.lastTraversed = now;

  if (this.options.getUpdate && this.syncedAt && this.options.getUpdate()) {
    if ((now - this.options.getUpdate()) < this.options.idleInterval) {
      // console.log('WAITING FOR ' + this.idleInterval + ' TO GET UN-IDLE');
      setTimeout(self.traverse.bind(self), this.options.idleInterval * 2);

      return this;
    }
  }

  if (!folder) {
    return this.getFolder();
  }

  chrome.bookmarks.getChildren(folder.id.toString(), function (results) {
    var _3c = 0;
    var ts;

    results.forEach(function (bookmark) {
      // console.log('Bookmark : ' + results.title);
      ts = self.isValidBookmark(bookmark);

      if (ts) {
        // console.log('Bookmark : ' + results.title + ' date : ' + ts + ' ; curTS : ' + _3c);
        if (self.options.deleteOther) {
          bookmarks.push(bookmark);
        }
        if (bookmark.url.indexOf('void') !== -1 && (ts > _3c)) {
          _37 = bookmark;
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

      // return self.options.onError('MISSING BOOKMARK')

      if (self.options.debug) {
        console.log('BSYNC ERROR : MISSING BOOKMARK');
      }

      return;
    }

    if (self.options.deleteOther) {
      bookmarks.forEach(function (b, i) {
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
  console.debug(bookmarkData);

  var content = this.getJSON(bookmarkData);
  var self = this;

  if (!content) {
    if (self.options.debug) {
      console.log('NO CONTENT FOUND > WRITING');
    }

    this.options.onWrite();
    // return this.options.onError('NO CONTENT')

    console.error('BSYNC ERROR: NO CONTENT');
    return;
  }

  this.content = content;
  this.syncedAt = bookmarkData.syncedAt;

  if (!_43 && this.shouldWrite()) {
    if (self.options.debug) {
      console.debug('About to write');
    }
    this.options.onWrite(content, bookmarkData);
  }
  else {
    if (this.shouldRead()) {
      if (self.options.debug) {
        console.debug('About to read');
      }
      this.syncedAtPrevious = this.syncedAt;
      this.markTimestamp();
      this.bookmark = bookmarkData;
      this.options.onRead(content, bookmarkData);
    }
    else {
      if (self.options.debug) {
        console.info('NOTHING TO DO :)');
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

BSync.prototype.write = function (bookmark) {
  var self = this;
  if (this.content && JSON.stringify(this.content) === JSON.stringify(bookmark)) {
    if (self.options.debug) {
      console.log('SORRY SAME CONTENT / BAILING OUT');
    }

    return false;
  }

  if (this.bookmark && this.bookmark.id) {
    try {
      chrome.bookmarks.remove('' + this.bookmark.id);
    }
    catch (e) {}
  }

  this.syncedAtPrevious = this.syncedAt;
  this.syncedAt = this.options.getUpdate() || new Date().getTime();
  // console.log('resultat de getUpdate: ' + this.options.getUpdate());

  var _49 = function (obj) {
    eachSync(obj, function (_4b, key) {
      if (_4b && _4b.toLowerCase && _4b.toLowerCase()) {
        obj[key] === _4b; // .replace(new RegExp('(' + String.fromCharCode(10) + '|' + String.fromCharCode(13) + ')', 'g'), self.options.newLine)
      }
    });

    return obj;
  };

  // console.log('To write : ' + $H(bookmark).toJSON());
  bookmark = _49(bookmark);

  // console.log('To write after each : ' + $H(bookmark).toJSON());
  // console.log('Written in bookmark : ' + JSON.stringify(bookmark));
  //
  chrome.bookmarks.create({
    parentId: this.folder.id.toString(),
    title: this.options.name + '.' + this.syncedAt,
    url: 'javascript:void("' + JSON.stringify(bookmark) + '");void(' + (Math.random() * 1000) + ');'
  }, function (_4d) {
    self.bookmark = _4d;
  });

  self.options.debug && console.log('\nWROTE > ' + JSON.stringify(bookmark));
  this.markTimestamp(true);
  return this;
};

BSync.prototype.start = function () {
  if (!this.isAttached) {
    return this.attach();
  }

  this.timer = setTimeout(function () {
    this.traverse();
  }.bind(this), this.options.interval);

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

BSync.prototype.setOptions = function (options) {
  for (var i in options) {
    if (typeof options[i] === 'function') {
      this.options[i] = options[i].bind(this);
    }
    else {
      this.options[i] = options[i];
    }
  }

  return this;
};

BSync.prototype.markTimestamp = function (local) {
  this['synced' + (local ? 'To' : 'From')] = new Date().getTime();
  return this;
};

BSync.prototype.getJSON = function (bookmark) {
  var url = bookmark.url.replace(/^.+?void\(("|')(.*?)\1\);void.*?$/, '$2');
  var json = '';

  if (url) {
    try {
      json = JSON.parse(url);
    }
    catch (ex) {
      console.error('Error loading the sync json:', ex.getStack());
      json = '';
    }
  }

  return json;
};

BSync.prototype.isValidBookmark = function (bookmark) {
  if (!bookmark) {
    return false;
  }

  var _5a = bookmark.title.match(new RegExp('^' + this.options.name + '\\.' + '([0-9]{10,}?)$'));

  if (!_5a) {
    return false;
  }

  bookmark.syncedAt = _5a[1];

  return parseInt(_5a[1], 10);
};
