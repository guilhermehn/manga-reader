let ReadingListActionsCreators = require('../actions/ReadingListActionsCreators');

let ReadingListAPI = {
  loadReadingList() {
    chrome.storage.sync.get('readingList', data => {
      let result = data.hasOwnProperty('readingList') ? data.readingList : [];

      ReadingListActionsCreators.loadReadingList(result);
    });
  }
};

module.exports = ReadingListAPI;
