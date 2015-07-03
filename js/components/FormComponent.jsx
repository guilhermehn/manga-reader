window.UserSettings = (() => {
  let savedData = localStorage.getItem('UserSettings');

  if (savedData) {
    return JSON.parse(savedData);
  }
  else {
    return {};
  }
})();

function updateStoredData (key, value) {
  window.UserSettings[key] = value;

  localStorage.setItem('UserSettings', JSON.stringify(UserSettings));
}

function getValue (elem) {
  let value;

  switch (elem.type) {
    case 'checkbox':
      value = elem.checked;
      break;

    case 'radio': {
      value = getValueFromRadio(elem);

      break;
    }

    default:
      value = elem.value;
  }

  return value;
}

function getValueFromRadio (elem) {
  let radios = elem.parentElement.querySelectorAll(`input[name='${elem.name}']`);
  let checked = _.slice(radios).filter((radio) => {
    return radio.checked;
  });

  return checked.length === 1 ? checked[0].value : null;
}

var loadUserSettings = {
  getUserSettingsForOption () {
    return UserSettings[this.props.id];
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
  mixins: [loadUserSettings],

  onChange (e) {
    let newValue = getValue(e.target);
    updateStoredData(this.props.id, newValue);
  },

  render () {
    return (
      <SettingComponent>
        <label htmlFor={this.props.id}>
          <input type={this.props.type} name={this.props.name ? this.props.name : this.props.id} id={this.props.id} onChange={this.onChange} value={this.state.value} /> {this.props.label}
        </label>
      </SettingComponent>
    );
  }
});

var CheckboxComponent = React.createClass({
  mixins: [loadUserSettings],

  render () {
    return (
      <InputComponent type='checkbox' id={this.props.id} label={this.props.label} />
    );
  }
});

var RadioGroupComponent = React.createClass({
  render () {
    return (
      <SettingComponent>
        {
          this.props.options.map((option) => {
            return <InputComponent type='radio' name={this.props.id} value={option.value} key={option.value} id={`${this.props.id}_${option.value}`} label={option.label} />;
          })
        }
      </SettingComponent>
    );
  }
});
