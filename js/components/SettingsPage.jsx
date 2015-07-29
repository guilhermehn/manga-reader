var loadUserSettingsMixin = {
  getValueFromRadio (elem) {
    let radios = elem.parentElement.querySelectorAll(`input[name='${elem.name}']`);
    let checked = AMRUtils.slice(radios).filter((radio) => {
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
      value: MR.settings[this.props.name ? this.props.name : this.props.id]
    };
  },

  onChange (e) {
    let newValue = this.getValue(e.target);
    MR.Storage.updateSettings(this.props.id, newValue);
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
    let checked = MR.settings[id];

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
            let checked = MR.settings[id] === value;

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

var SettingsSectionComponent = React.createClass({
  render () {
    return (
      <section className='settings-section'>
        <h3>{this.props.title}</h3>
        {this.props.children}
      </section>
    );
  }
});

var SettingsPage = React.createClass({
  render () {
    return (
      <section className='page-content'>
        <h2>Settings</h2>
        <SettingsSectionComponent title='Sync'>
          <CheckboxComponent label='Use Chrome Sync to synchronize my reading data' id='syncData' />
        </SettingsSectionComponent>

        <SettingsSectionComponent title='Display mode'>
          <CheckboxComponent label='Show the whole chapter in one page' id='showWholeChapter' />
        </SettingsSectionComponent>

        <SettingsSectionComponent title='Chapter reading'>
          <RadioGroupComponent id='chapterDisplayMode' options={[
            {
              label: 'One page',
              value: 'singlePage'
            },
            {
              label: 'Double page',
              value: 'doublePage'
            }
          ]} />
        </SettingsSectionComponent>

        <SettingsSectionComponent title='Chapter loading'>
          <CheckboxComponent label='Show the loading progress on the tab title' id='showTitleProgress' />
          <CheckboxComponent label='Load pages in order' id='pageLoadOrder' />
          <CheckboxComponent label='Load the next chapter right after the actual chapter loading is done' id='loadNextChapter' />
          <CheckboxComponent label='Mark the chapter as read when it`s done loading' id='markAsReadOnLoad' />
        </SettingsSectionComponent>

        <SettingsSectionComponent title='Miscellaneous'>
          <CheckboxComponent label='Show ads' id='showAds' />
          <CheckboxComponent label='Show navigation bar' id='showNavigationBar' />
          <CheckboxComponent label='Add manga to the reading list when I first read a chapter' id='autoAddMangaToList' />
          <CheckboxComponent label='Use the left and right arrow keys to navigate between the pages' id='useArrowsToNavigate' />
          <CheckboxComponent label='Add page to bookmarks on double click' id='bookmarkOnDoubleClick' />
          <CheckboxComponent label='Open next chapter when pressing right arrow on the last page' id='nextChapterAfterLastPage' />
          <CheckboxComponent label='Show link to send feedback' id='feedbackLink' />
          <CheckboxComponent label='Show developer options' id='showDevOptions' />
        </SettingsSectionComponent>
      </section>
    );
  }
});

MR.Router.register('settings', () => {
  MR.renderPage(<SettingsPage />);
});
