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

function RenderPage (mountPoint) {
  React.render(<SettingsPage settings={UserSettings} />, document.querySelector(mountPoint));
}
