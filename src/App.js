let React = require('react'); // eslint-disable-line
let {render} = require('react-dom');
let {Router, Route} = require('react-router');
let ControlPanel = require('./components/ControlPanel.react');
let ReadingListPage = require('./components/ReadingListPage.react');
let SearchPage = require('./components/SearchPage.react');
let SettingsPage = require('./components/SettingsPage.react');
let ReaderPage = require('./components/ReaderPage.react');
let Storage = require('./Storage');
Storage.init();

render((
  <Router>
    <Route path='/' component={ControlPanel}>
      <Route path='reading' component={ReadingListPage} />
      <Route path='search' component={SearchPage} />
      <Route path='settings' component={SettingsPage} />
    </Route>
    <Route path='/reader/:name' component={ReaderPage} />
    <Route path='/reader/:name/:chapter' component={ReaderPage} />
  </Router>
), document.querySelector('#root'));
