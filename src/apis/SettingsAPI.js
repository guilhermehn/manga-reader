import localforage from 'localforage';
import SettingsActionsCreators from '../actions/SettingsActionsCreators';
import {SETTINGS_KEY, DEFAULT_SETTINGS} from '../constants/SettingsConstants';

const SettingsAPI = {
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

export default SettingsAPI;
