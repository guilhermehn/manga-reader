// Components global namespace
window.Components = {};

let __uniqueIdSet = {};

window._ = {
  uniqueId () {
    let idsCount = Object.keys(__uniqueIdSet).length.toString();
    __uniqueIdSet[idsCount] = Symbol();
    return idsCount;
  },

  slice (object) {
    return [].slice.call(object);
  }
};

const DEFAULT_SETTINGS = {
  syncData: false,
  showWholeChapter: true,
  chapterDisplayMode: 'singlePage',
  showTitleProgress: false,
  pageLoadOrder: false,
  loadNextChapter: true,
  markAsReadOnLoad: false,
  showAds: true,
  showNavigationBar: true,
  autoAddMangaToList: false,
  useArrowsToNavigate: true,
  bookmarkOnDoubleClick: true,
  nextChapterAfterLastPage: true,
  feedbackLink: true,
  showDevOptions: false
};

const LOCALSTORAGE_KEY = 'UserSettings';

window.UserSettings = (() => {
  let savedData = localStorage.getItem(LOCALSTORAGE_KEY);

  if (savedData) {
    return JSON.parse(savedData);
  }
  else {
    return {};
  }
})();

function updateStoredData (key, value) {
  UserSettings[key] = value;

  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(UserSettings));
}

function clearUserSettings () {
  localStorage.removeItem(LOCALSTORAGE_KEY);
}
