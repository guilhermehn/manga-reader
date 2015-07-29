var AMRUtils = {
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

(() => {
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
    showDevOptions: false
  };

  let MR = {
    Pages: {},
    Routes: {},
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
        return 'search';
      }

      return route;
    },

    renderActualRoute () {
      var route = this.getActualRoute();

      if (!MR.Routes.hasOwnProperty(route)) {
        route = 'search';
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

  MR.Storage = Storage;
  MR.Router = Router;
  MR.Components = Components;

  window.MR = MR;
})();
