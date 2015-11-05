let keyMirror = require('keymirror');

module.exports = {
  STORAGE_KEY: 'readingList',
  ACTION_TYPES: keyMirror({
    LOAD_READING_LIST: null
  })
};
