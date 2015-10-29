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
  showDevOptions: false,
  dismissMigration: false
};

const Constants = {
  DEFAULT_ROUTE: 'search',
  PAGE_MOUNT_POINT: document.querySelector('.content'),
  LOCALSTORAGE_KEY: 'UserSettings',
  DEFAULT_SETTINGS: DEFAULT_SETTINGS
};

module.exports = Constants;
