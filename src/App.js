let React = require('react'); // eslint-disable-line
let {render} = require('react-dom');
let {Router, Route} = require('react-router');
let ControlPanel = require('./components/ControlPanel.react');
let SearchPage = require('./components/SearchPage.react');
let SettingsPage = require('./components/SettingsPage.react');
let ReaderPage = require('./components/ReaderPage.react');
let Storage = require('./Storage');
// let Migration = require('./Migration');

Storage.init();
// Migration.init();

render((
  <Router>
    <Route path='/' component={ControlPanel}>
      <Route path='search' component={SearchPage} />
      <Route path='settings' component={SettingsPage} />
    </Route>
    <Route path='/reader/:name' component={ReaderPage} />
  </Router>
), document.querySelector('#root'));
