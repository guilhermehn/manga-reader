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

const DEFAULT_ROUTE = 'search';
const PAGE_MOUNT_POINT = document.querySelector('.content');
const LOCALSTORAGE_KEY = 'UserSettings';

export {DEFAULT_SETTINGS, DEFAULT_ROUTE, PAGE_MOUNT_POINT, LOCALSTORAGE_KEY};
