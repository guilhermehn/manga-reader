let SettingsActionsCreators = require('../actions/SettingsActionsCreators');
let {
  SETTINGS_KEY,
  DEFAULT_SETTINGS
} = require('../constants/SettingsConstants');

let SettingsAPI = {
  getSettings() {
    let savedData = localStorage.getItem(SETTINGS_KEY);

    if (savedData) {
      return JSON.parse(savedData);
    }
    else {
      return DEFAULT_SETTINGS;
    }
  },

  loadSettings() {
    process.nextTick(() => {
      let settings = this.getSettings();
      SettingsActionsCreators.receiveSettings(settings);
    });
  },

  setOption(option, value) {
    let settings = this.getSettings();
    settings[option] = value;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    this.loadSettings();
  }
};

module.exports = SettingsAPI;
