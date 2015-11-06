let keyMirror = require('keymirror');

let ReaderConstants = {
  ACTION_TYPES: keyMirror({
    RECEIVE_MANGA_WITH_PAGES: null,
    STARTED_LOADING_MANGA: null,
    PAGE_DID_LOAD: null,
    RESET_LOADED_PAGES_COUNT: null
  })
};

module.exports = ReaderConstants;
