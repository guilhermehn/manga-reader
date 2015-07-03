class SettingsSectionComponent extends React.Component {
  render () {
    return (
      <section className='settings-section'>
        <h3>{this.props.title}</h3>
        {this.props.children}
      </section>
    );
  }
}

class SettingsPage extends React.Component {
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
      </section>
    );
  }
}

function RenderPage (mountPoint) {
  React.render(<SettingsPage />, document.querySelector(mountPoint));
}
