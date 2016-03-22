import localforage from 'localforage'
import SettingsActionsCreators from '../actions/SettingsActionsCreators'
import { SETTINGS_KEY, DEFAULT_SETTINGS } from '../constants/SettingsConstants'

export function getSettings(done) {
  localforage.getItem(SETTINGS_KEY, (err, value) => {
    if (err || !value) {
      done(DEFAULT_SETTINGS)
    }
    else {
      done(value)
    }
  })
}

export function loadSettings() {
  this.getSettings(settings =>
    SettingsActionsCreators.receiveSettings(settings))
}

export function setOption(option, value) {
  this.getSettings(settings => {
    settings[option] = value
    localforage.setItem(SETTINGS_KEY, settings, () => this.loadSettings())
  })
}

const SettingsAPI = {
  getSettings,
  loadSettings,
  setOption
}

export default SettingsAPI
