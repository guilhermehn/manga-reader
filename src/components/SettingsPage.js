import React from 'react'

import SettingsStore from '../stores/SettingsStore'
import SettingsAPI from '../apis/SettingsAPI'

import { SETTINGS_SECTIONS } from '../constants/SettingsConstants'

import SettingsHolder from './settings/SettingsHolder'
import MigrationNotice from './settings/MigrationNotice'

import SettingsContent from './settings/SettingsContent'

function getStateFromStores() {
  return {
    settings: SettingsStore.getSettings()
  }
}

function dismissMigration() {
  SettingsAPI.setOption('dismissMigration', true)
}

const SettingsPage = React.createClass({
  getInitialState() {
    return getStateFromStores()
  },

  componentDidMount() {
    SettingsAPI.loadSettings()

    SettingsStore.addChangeListener(this._onChange)
  },

  componentWillUnmount() {
    SettingsStore.removeChangeListener(this._onChange)
  },

  _onChange() {
    this.setState(getStateFromStores())
  },

  componentDidUpdate() {
    // When changing the sync option, the user
    // must be remembered about migrating the
    // old data if not already migrated
  },

  getSettingsValue(key) {
    return this.state.settings[key]
  },

  render() {
    let settings = this.state.settings

    if (Object.keys(settings).length === 0) {
      // This should return a loader view
      return (
        <SettingsHolder>
          <h3>Loading settings...</h3>
        </SettingsHolder>
      )
    }

    let shouldShowMigrationNotice = settings.syncData && !settings.dismissMigration

    return (
      <SettingsHolder>
        { shouldShowMigrationNotice && <MigrationNotice onDismiss={ dismissMigration } /> }
        <SettingsContent sections={ SETTINGS_SECTIONS } settings={ settings } />
      </SettingsHolder>
    )
  }
})

export default SettingsPage
