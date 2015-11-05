let localforage = require('localforage');
let SettingsActionsCreators = require('../actions/SettingsActionsCreators');
let {
  SETTINGS_KEY,
  DEFAULT_SETTINGS
} = require('../constants/SettingsConstants');

let SettingsAPI = {
  getSettings(done) {
    localforage.getItem(SETTINGS_KEY, (err, value) => {
      if (err || !value) {
        done(DEFAULT_SETTINGS);
      }
      else {
        done(value);
      }
    });
  },

  loadSettings() {
    this.getSettings(settings =>
      SettingsActionsCreators.receiveSettings(settings));
  },

  setOption(option, value) {
    this.getSettings(settings => {
      settings[option] = value;
      localforage.setItem(SETTINGS_KEY, settings, () => this.loadSettings());
    });
  }
};

module.exports = SettingsAPI;
