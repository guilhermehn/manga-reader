import React from 'react'
import { render } from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'
import ControlPanel from './components/ControlPanel'
import ReadingListPage from './components/ReadingListPage'
import SearchPage from './components/SearchPage'
import SettingsPage from './components/SettingsPage'
import ReaderPage from './components/ReaderPage'
import Storage from './Storage'
Storage.init()

const routes = (
  <Router history={ hashHistory }>
    <Route path='/' component={ ControlPanel }>
      <Route path='reading' component={ ReadingListPage } />
      <Route path='search' component={ SearchPage } />
      <Route path='settings' component={ SettingsPage } />
    </Route>
    <Route path='/reader/:name/:source' component={ ReaderPage } />
    <Route path='/reader/:name/:source/:chapter' component={ ReaderPage } />
  </Router>
)

render(routes, document.querySelector('#root'))
