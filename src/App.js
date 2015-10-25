'use strict';

let React = require('react'); // eslint-disable-line
let ReactDOM = require('react-dom');
let Menu = require('./components/Menu.react');
let Header = require('./components/Header.react');
let Router = require('./Router');
let Storage = require('./Storage');
// let Migration = require('./Migration');

Storage.init();
Router.init();
// Migration.init();

ReactDOM.render(<Header />, document.querySelector('header'));
ReactDOM.render(<Menu />, document.querySelector('.menu'));
