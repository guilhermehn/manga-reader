'use strict';

let React = require('react'); // eslint-disable-line
let ReactDOM = require('react-dom');
let MenuComponent = require('./components/Menu.react');
let HeaderComponent = require('./components/Header.react');
let Router = require('./Router');
let Storage = require('./Storage');
let Migration = require('./Migration');

Storage.init();
Router.init();
Migration.init();

ReactDOM.render(<HeaderComponent />, document.querySelector('header'));
ReactDOM.render(<MenuComponent />, document.querySelector('.menu'));
