/* global chrome */
'use strict';

let Migration = {
  bookmarkId: null,
  canMigrate: false,

  hasLegacyData(callback) {
    chrome.bookmarks.getChildren('2', (bookmarks) => {
      let legacySyncBookmark = bookmarks.filter(bookmark => bookmark.title === 'BSync');

      if (legacySyncBookmark.length) {
        let id = legacySyncBookmark[0].id;

        this.bookmarkId = id;
        callback(true);
      }
      else {
        callback(false);
      }
    });
  },

  getDataFromBookmark(bookmark) {
    let url = bookmark.url.replace(/^.+?void\(("|')(.*?)\1\);void.*?$/, '$2');
    let syncData;

    if (url) {
      try {
        syncData = JSON.parse(url);
        return JSON.parse(syncData.mangas);
      }
      catch (ex) {
        console.error('Error loading the sync json:', ex.getStack());
        return null;
      }
    }
  },

  getBookmarkForId(id, callback) {
    chrome.bookmarks.getChildren(id, (bookmarks) => {
      let oldSyncData = bookmarks.filter(bookmark => /^All Mangas Reader\./.test(bookmark.title));

      if (oldSyncData.length) {
        callback(oldSyncData[0]);
      }
      else {
        callback(null);
      }
    });
  },

  dismiss() {
    this.updateSettings('dismissMigration', true);
  },

  init(callback) {
    this.hasLegacyData((yes) => {
      this.canMigrate = yes;

      if (yes) {
        this.getBookmarkForId(this.bookmarkId, (bookmark) => {
          let mangas = this.getDataFromBookmark(bookmark);

          if (callback && typeof callback === 'function') {
            callback(mangas);
          }

          // console.log(mangas);
        });
      }
    });
  }
};

module.exports = Migration;
