let localforage = require('localforage');
let SettingsAPI = require('./SettingsAPI');
let {STORAGE_KEY} = require('../constants/ReadingListConstants');
let ReadingListActionsCreators = require('../actions/ReadingListActionsCreators');

function loadFromChromeSync(callback) {
  chrome.storage.sync.get(STORAGE_KEY, data => {
    if (!data || !data.hasOwnProperty(STORAGE_KEY)) {
      callback([]);
      return;
    }

    callback(data[STORAGE_KEY]);
  });
}

function loadFromLocalforage(callback) {
  localforage.getItem(STORAGE_KEY, (err, data) => {
    if (err) {
      callback([]);
      return;
    }

    callback(data ? data : []);
  });
}

function loadReadingList(callback) {
  SettingsAPI.getSettings(settings => {
    if (settings.syncData) {
      loadFromChromeSync(callback);
    }
    else {
      loadFromLocalforage(callback);
    }
  });
}

let ReadingListAPI = {
  loadReadingList() {
    loadReadingList(readingList =>
      ReadingListActionsCreators.loadReadingList(readingList));
  },

  getManga(mangaName, callback) {
    loadReadingList(readingList => {
      let manga = readingList.filter(manga => mangaName === manga.normalizedName);

      if (!manga.length) {
        callback(null);
        return;
      }

      callback(manga[0]);
    });
  }
};

module.exports = ReadingListAPI;
