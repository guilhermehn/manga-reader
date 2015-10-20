let AppDispatcher = require('../dispatcher/AppDispatcher');
let EventEmitter = require('events').EventEmitter;
const CHANGE_EVENT = 'change';
let {
  ACTION_TYPES
} = require('../constants/SettingsConstants');

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
  switch(action.type) {
  case ACTION_TYPES.RECEIVE_SETTINGS:
    SettingsStore.receiveSettings(action.settings);
    break;

  default:
  }
});

module.exports = SettingsStore;
