import localforage from 'localforage';
import SettingsAPI from './SettingsAPI';
import {STORAGE_KEY} from '../constants/ReadingListConstants';
import ReadingListActionsCreators from '../actions/ReadingListActionsCreators';

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

const ReadingListAPI = {
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

export default ReadingListAPI;
