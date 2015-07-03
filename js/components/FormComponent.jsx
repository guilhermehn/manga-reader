var STORAGE = {};

function updateStoredData (key, value) {
  localStorage.setItem(key, value);
}

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
  getValue (elem) {
    let value;

    switch (this.props.type) {
      case 'checkbox':
        value = elem.checked;
        break;

      case 'radio': {
        let radios = elem.parentElement.querySelectorAll(`input[name='${elem.name}']`);
        let checked = _.slice(radios).filter((radio) => {
          return radio.checked;
        });

        if (checked.length === 1) {
          value = checked[0].value;
        }
        else {
          value = null;
        }

        break;
      }

      default:
        value = elem.value;
    }

    return value;
  },

  onChange (e) {
    let newValue = this.getValue(e.target);
    console.log(newValue);
    updateStoredData(this.props.id, newValue);
  },

  render () {
    return (
      <SettingComponent>
        <label htmlFor={this.props.id}>
          <input type={this.props.type} name={this.props.name ? this.props.name : this.props.id} id={this.props.id} onChange={this.onChange} value={this.props.value} /> {this.props.label}
        </label>
      </SettingComponent>
    );
  }
});

var CheckboxComponent = React.createClass({
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
