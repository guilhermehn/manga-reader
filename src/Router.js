'use strict';

let React = require('react'); // eslint-disable-line
let ReactDOM = require('react-dom');

const {
  DEFAULT_ROUTE,
  PAGE_MOUNT_POINT
} = require('./Constants');

let Router = {
  routes: {
    search: require('./pages/SearchPage.react'),
    settings: require('./pages/SettingsPage.react')
  },

  renderPage (PageComponent) {
    ReactDOM.render(<PageComponent />, PAGE_MOUNT_POINT);
  },

  getActualRoute() {
    let route = window.location.hash.replace(/^\#\//, '');

    if (route === '' || !this.routes.hasOwnProperty(route)) {
      return DEFAULT_ROUTE;
    }

    return route;
  },

  renderActualRoute() {
    let component = this.routes[this.getActualRoute()];

    this.renderPage(component);
  },

  init() {
    this.renderActualRoute();

    window.addEventListener('hashchange', this.renderActualRoute.bind(this));
  }
};

module.exports = Router;
