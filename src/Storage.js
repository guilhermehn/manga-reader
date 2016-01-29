import {DEFAULT_SETTINGS, LOCALSTORAGE_KEY} from './Constants';

let settings = {};
let userSettings = {};

let Storage = {
  updateGlobalSettings () {
    settings = Object.assign({}, DEFAULT_SETTINGS, userSettings);
  },

  loadSettings () {
    let savedData = localStorage.getItem(LOCALSTORAGE_KEY);

    if (savedData) {
      userSettings = JSON.parse(savedData);
    }
    else {
      userSettings = {};
    }

    this.updateGlobalSettings();
  },

  updateSettings (key, value) {
    userSettings[key] = value;
    this.updateGlobalSettings();

    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(userSettings));
  },

  clearUserSettings () {
    localStorage.removeItem(LOCALSTORAGE_KEY);
  },

  init() {
    this.loadSettings();
  }
};

export default Storage;
