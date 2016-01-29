import AppDispatcher from '../dispatcher/AppDispatcher';
import {EventEmitter} from 'events';
import {ACTION_TYPES} from '../constants/SettingsConstants';

const CHANGE_EVENT = 'change';

let _settings = {};

let SettingsStore = Object.assign({}, EventEmitter.prototype, {
  emitChange() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  receiveSettings(settings) {
    _settings = settings;
    this.emitChange();
  },

  getSettings() {
    return _settings;
  }
});

SettingsStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {
  case ACTION_TYPES.RECEIVE_SETTINGS: {
    SettingsStore.receiveSettings(action.settings);
    break;
  }
  }
});

export default SettingsStore;
