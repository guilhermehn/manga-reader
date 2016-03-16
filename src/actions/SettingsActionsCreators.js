import AppDispatcher from '../dispatcher/AppDispatcher'
import { ACTION_TYPES } from '../constants/SettingsConstants'

export default {
  receiveSettings(settings) {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.RECEIVE_SETTINGS,
      settings: settings
    })
  }
}
