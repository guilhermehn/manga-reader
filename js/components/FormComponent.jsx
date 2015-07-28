var loadUserSettingsMixin = {
  getUserSettingsForOption (option) {
    if (UserSettings.hasOwnProperty(option)) {
      return UserSettings[option];
    }
    else {
      return DEFAULT_SETTINGS[option];
    }
  },

  getValueFromRadio (elem) {
    let radios = elem.parentElement.querySelectorAll(`input[name='${elem.name}']`);
    let checked = _.slice(radios).filter((radio) => {
      return radio.checked;
    });

    return checked.length === 1 ? checked[0].value : null;
  },

  getValue (elem) {
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

  getInitialState () {
    return {
      value: this.getUserSettingsForOption(this.props.name ? this.props.name : this.props.id)
    };
  },

  onChange (e) {
    let newValue = this.getValue(e.target);
    updateStoredData(this.props.id, newValue);
    this.forceUpdate();
  }
};

var SettingComponent = React.createClass({
  render () {
    return (
      <div className='settings-option'>
        {this.props.children}
      </div>
    );
  }
});

var InputComponent = React.createClass({
  mixins: [loadUserSettingsMixin],

  render () {
    let name = this.props.name ? this.props.name : this.props.id;
    let {type, id, label} = this.props;

    return (
      <SettingComponent>
        <label htmlFor={this.props.id}>
          <input type={type} name={name} id={id} onChange={this.onChange} value={this.state.value} /> {label}
        </label>
      </SettingComponent>
    );
  }
});

var CheckboxComponent = React.createClass({
  mixins: [loadUserSettingsMixin],

  render () {
    let {id, label} = this.props;
    let checked = this.getUserSettingsForOption(id);

    return (
      <SettingComponent>
        <label htmlFor={id}>
          <input type='checkbox' name={id} id={id} onChange={this.onChange} checked={checked} /> {label}
        </label>
      </SettingComponent>
    );
  }
});

var RadioGroupComponent = React.createClass({
  mixins: [loadUserSettingsMixin],

  render () {
    return (
      <SettingComponent>
        {
          this.props.options.map((option) => {
            let {value, label} = option;
            let id = this.props.id;
            let key = `${id}_${value}`;
            let checked = this.getUserSettingsForOption(id) === value;

            return (
              <label htmlFor={key} key={key}>
                <input type='radio' name={id} checked={checked} onChange={this.onChange} value={value} id={key} /> {label}
              </label>
            );
          })
        }
      </SettingComponent>
    );
  }
});
