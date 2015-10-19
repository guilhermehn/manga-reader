'use strict';

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

const MENU_ITEMS = [
  {
    route: 'search',
    title: 'Search',
    iconClassname: 'zmdi-search'
  },
  {
    route: 'bookmarks',
    title: 'Bookmarks',
    iconClassname: 'zmdi-bookmark'
  },
  {
    route: 'import-export',
    title: 'Import/Export',
    iconClassname: 'zmdi-import-export'
  },
  {
    route: 'settings',
    title: 'Settings',
    iconClassname: 'zmdi-settings'
  },
  {
    route: 'help',
    title: 'Help',
    iconClassname: 'zmdi-help'
  }
];

let DEV_MENU_ITEMS = [
  {
    route: 'lab',
    title: 'Lab',
    iconClassname: 'zmdi-developer-board'
  },
  {
    route: 'dev',
    title: 'Development',
    iconClassname: 'zmdi-code'
  },
  {
    route: 'http://wiki.allmangasreader.com/changelog',
    title: 'Changelog',
    iconClassname: 'zmdi-info'
  }
];

const Constants = {
  DEFAULT_ROUTE: 'search',
  PAGE_MOUNT_POINT: document.querySelector('.content'),
  LOCALSTORAGE_KEY: 'UserSettings',
  DEFAULT_SETTINGS: DEFAULT_SETTINGS,
  MENU_ITEMS: MENU_ITEMS,
  DEV_MENU_ITEMS: DEV_MENU_ITEMS
};

module.exports = Constants;
