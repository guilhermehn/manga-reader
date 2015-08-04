(() => {
  let MRUtils = {
    __uniqueIdSet: {},

    uniqueId () {
      let idsCount = Object.keys(this.__uniqueIdSet).length.toString();
      this.__uniqueIdSet[idsCount] = Symbol();
      return idsCount;
    },

    slice (object) {
      return [].slice.call(object);
    }
  };

  let DEFAULT_SETTINGS = {
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

  let MR = {
    Pages: {},
    Routes: {},
    DEFAULT_ROUTE: 'search',
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    PAGE_MOUNT_POINT: document.querySelector('.content'),
    LOCALSTORAGE_KEY: 'UserSettings',

    settings: null,
    userSettings: null,

    renderPage (pageComponent) {
      React.render(pageComponent, this.PAGE_MOUNT_POINT);
    },

    init () {
      this.Storage.loadSettings();
    },

    initPages () {
      this.init();
      this.Router.init();
      MR.Migration.init();

      MR.Components.render('HeaderComponent', 'header');
      MR.Components.render('MenuComponent', '.menu');
    }
  };

  let Storage = {
    updateGlobalSettings () {
      MR.settings = Object.assign({}, MR.DEFAULT_SETTINGS, MR.userSettings);
    },

    loadSettings () {
      let savedData = localStorage.getItem(MR.LOCALSTORAGE_KEY);

      if (savedData) {
        MR.userSettings = JSON.parse(savedData);
      }
      else {
        MR.userSettings = {};
      }

      MR.Storage.updateGlobalSettings();
    },

    updateSettings (key, value) {
      MR.userSettings[key] = value;
      MR.Storage.updateGlobalSettings();

      localStorage.setItem(MR.LOCALSTORAGE_KEY, JSON.stringify(MR.userSettings));
    },

    clearUserSettings () {
      localStorage.removeItem(MR.LOCALSTORAGE_KEY);
    }
  };

  let Router = {
    listeners: {},

    register (name, action) {
      MR.Routes[name] = action;
    },

    getActualRoute () {
      let route = window.location.hash.replace(/^\#\//, '');

      if (route === '') {
        return MR.DEFAULT_ROUTE;
      }

      return route;
    },

    renderActualRoute () {
      var route = this.getActualRoute();

      if (!MR.Routes.hasOwnProperty(route)) {
        route = MR.DEFAULT_ROUTE;
      }

      MR.Routes[route]();
    },

    addListener (name, callback) {
      this.listeners[name] = callback;

      window.addEventListener('hashchange', callback);
    },

    init () {
      this.renderActualRoute();

      window.addEventListener('hashchange', this.renderActualRoute.bind(this));
    }
  };

  let Components = {
    register (name, component) {
      if (this.hasOwnProperty(name)) {
        if (name === 'register' || name === 'render') {
          throw `Trying to register a component with a invalid name: "${name}"`;
        }

        throw `Trying to register a component that already exists: "${name}"`;
      }

      this[name] = component;
    },

    render (name, mountPoint) {
      if (this.hasOwnProperty(name)) {
        React.render(this[name], document.querySelector(mountPoint));
      }
    },
  };

  let Migration = {
    bookmarkId: null,

    canMigrate: false,

    hasLegacyData (callback) {
      chrome.bookmarks.getChildren('2', (bookmarks) => {
        let legacySyncBookmark = bookmarks.filter(bookmark => bookmark.title === 'BSync');

        if (legacySyncBookmark.length) {
          let id = legacySyncBookmark[0].id;

          this.bookmarkId = id;
          callback(true);
        }
        else {
          callback(false);
        }
      });
    },

    getDataFromBookmark (bookmark) {
      let url = bookmark.url.replace(/^.+?void\(("|')(.*?)\1\);void.*?$/, '$2');
      let syncData;

      if (url) {
        try {
          syncData = JSON.parse(url);
        }
        catch (ex) {
          console.error('Error loading the sync json:', ex.getStack());
          syncData = null;
        }
      }

      return JSON.parse(syncData.mangas);
    },

    getBookmarkForId (id, callback) {
      chrome.bookmarks.getChildren(id, (bookmarks) => {
        let oldSyncData = bookmarks.filter(bookmark => /^All Mangas Reader\./.test(bookmark.title));

        if (oldSyncData.length) {
          callback(oldSyncData[0]);
        }
        else {
          callback(null);
        }
      });
    },

    dismiss () {
      MR.Storage.updateSettings('dismissMigration', true);
    },

    init (callback) {
      this.hasLegacyData((yes) => {
        this.canMigrate = yes;

        if (yes) {
          this.getBookmarkForId(this.bookmarkId, (bookmark) => {
            let mangas = this.getDataFromBookmark(bookmark);

            console.log(mangas);
          });
        }
      });
    }
  }

  MR.Storage = Storage;
  MR.Router = Router;
  MR.Components = Components;
  MR.Migration = Migration;

  window.MR = MR;
  window.MRUtils = MRUtils;
})();
