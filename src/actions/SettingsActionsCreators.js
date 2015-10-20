let AppDispatcher = require('../dispatcher/AppDispatcher');

let {
  ACTION_TYPES
} = require('../constants/SettingsConstants');

module.exports = {
  receiveSettings(settings) {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.RECEIVE_SETTINGS,
      settings: settings
    });
  }
};
