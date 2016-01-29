import React from 'react';
import _ from 'lodash';
import SettingsStore from '../stores/SettingsStore';
import SettingsAPI from '../apis/SettingsAPI';
import {SETTINGS_SECTIONS} from '../constants/SettingsConstants';

function getStateFromStores() {
  return {
    settings: SettingsStore.getSettings()
  };
}

function dismissMigration() {
  SettingsAPI.setOption('dismissMigration', true);
}

const loadUserSettingsMixin = {
  getInitialState() {
    return {
      value: this.props.value
    };
  },

  getValueFromRadio(elem) {
    let radios = elem.parentElement.querySelectorAll(`input[name='${elem.name}']`);

    let checked = _.slice(radios).filter((radio) => {
      return radio.checked;
    });

    return checked.length === 1 ? checked[0].value : null;
  },

  getValue(elem) {
    let value;

    switch (elem.type) {
    case 'checkbox':
      value = elem.checked;
      break;

    case 'radio': {
      value = this.getValueFromRadio(elem);

      break;
    }

    default:
      value = elem.value;
    }

    return value;
  },

  onChange(e) {
    let newValue = this.getValue(e.target);
    SettingsAPI.setOption(this.props.id, newValue);
  }
};

const MigrationNotice = React.createClass({
  render() {
    return (
      <div className='notice'>
        <p><strong>'All Mangas Reader' data was found. Import to the new format?</strong></p>
        <button type='button' className='btn-confirm'>Import</button>
        <button type='button' onClick={dismissMigration}>No</button>
      </div>
    );
  }
});

const Setting = React.createClass({
  render() {
    return (
      <div className='settings-option'>
        {this.props.children}
      </div>
    );
  }
});

const Checkbox = React.createClass({
  mixins: [loadUserSettingsMixin],

  render() {
    let {id, label, value} = this.props;

    return (
      <Setting>
        <label htmlFor={id}>
          <input type='checkbox' name={id} id={id} defaultChecked={value} onChange={this.onChange} /> {label}
        </label>
      </Setting>
    );
  }
});

const RadioGroup = React.createClass({
  mixins: [loadUserSettingsMixin],

  render() {
    return (
      <Setting>
        {
          this.props.options.map((option) => {
            let {id, value} = this.props;
            let key = `${id}_${option.value}`;

            return (
              <label htmlFor={key} key={key}>
                <input type='radio' name={id} defaultChecked={option.value === value} onChange={this.onChange} value={option.value} id={key} /> {option.label}
              </label>
            );
          })
        }
      </Setting>
    );
  }
});

const SettingsSection = React.createClass({
  render() {
    return (
      <section className='settings-section'>
        <h3>{this.props.title}</h3>
        {this.props.children}
      </section>
    );
  }
});

const SettingsContent = React.createClass({
  render() {
    return (
      <section className='page-content'>
        <h2>Settings</h2>
        {this.props.children}
      </section>
    );
  }
});

function createSections(sections, settings) {
  return sections.map((section) => {
    return (
      <SettingsSection key={section.title} title={section.title}>
        {
          section.fields.map((field) => {
            let value = settings[field.id];

            switch(field.type) {
            case 'checkbox':
              return <Checkbox id={field.id} key={field.id} label={field.label} value={value} />;

            case 'radio':
              return <RadioGroup id={field.id} key={field.id} options={field.options} value={value} />;

            default:
            }
          })
        }
      </SettingsSection>
    );
  });
}

const SettingsPage = React.createClass({
  getInitialState() {
    return getStateFromStores();
  },

  componentDidMount() {
    SettingsAPI.loadSettings();

    SettingsStore.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
    SettingsStore.removeChangeListener(this._onChange);
  },

  _onChange() {
    this.setState(getStateFromStores());
  },

  componentDidUpdate() {
    // When changing the sync option, the user
    // must be remembered about migrating the
    // old data if not already migrated
  },

  getSettingsValue(key) {
    return this.state.settings[key];
  },

  render() {
    let settings = this.state.settings;

    if (Object.keys(settings).length === 0) {
      // This should return a loader view
      return (
        <SettingsContent>
          <h3>Loading settings...</h3>
        </SettingsContent>
      );
    }

    let shouldShowMigrationNotice = settings.syncData && !settings.dismissMigration;

    return (
      <SettingsContent>
        {shouldShowMigrationNotice && <MigrationNotice />}

        {createSections(SETTINGS_SECTIONS, settings)}
      </SettingsContent>
    );
  }
});

export default SettingsPage;
