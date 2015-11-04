let ReadingListActionsCreators = require('../actions/ReadingListActionsCreators');

function loadReadingList(callback) {
  chrome.storage.sync.get('readingList', data => {
    let result = data.hasOwnProperty('readingList') ? data.readingList : [];

    callback(result);
  });
}

let ReadingListAPI = {
  loadReadingList() {
    loadReadingList(readingList => {
      ReadingListActionsCreators.loadReadingList(readingList);
    });
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
