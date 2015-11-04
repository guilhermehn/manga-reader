let keyMirror = require('keymirror');

let ReaderConstants = {
  ACTION_TYPES: keyMirror({
    RECEIVE_MANGA_WITH_PAGES: null,
    STARTED_LOADING_MANGA: null
  })
};

module.exports = ReaderConstants;
