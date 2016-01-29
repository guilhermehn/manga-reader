import React from 'react'; // eslint-disable-line
import {render} from 'react-dom';
import {Router, Route, hashHistory} from 'react-router';
import ControlPanel from './components/ControlPanel.react';
import ReadingListPage from './components/ReadingListPage.react';
import SearchPage from './components/SearchPage.react';
import SettingsPage from './components/SettingsPage.react';
import ReaderPage from './components/ReaderPage.react';
import Storage from './Storage';
Storage.init();

const routes = (
  <Router history={hashHistory}>
    <Route path='/' component={ControlPanel}>
      <Route path='reading' component={ReadingListPage} />
      <Route path='search' component={SearchPage} />
      <Route path='settings' component={SettingsPage} />
    </Route>
    <Route path='/reader/:name/:source' component={ReaderPage} />
    <Route path='/reader/:name/:source/:chapter' component={ReaderPage} />
  </Router>
);

render(routes, document.querySelector('#root'));
