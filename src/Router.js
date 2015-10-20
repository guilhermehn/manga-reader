'use strict';

let React = require('react'); // eslint-disable-line
let ReactDOM = require('react-dom');

const {
  DEFAULT_ROUTE,
  PAGE_MOUNT_POINT
} = require('./Constants');

const HASH_CHANGE_EVENT = 'hashchange';

function addHashListener(callback) {
  window.addEventListener(HASH_CHANGE_EVENT, callback);
}

function removeHashListener(callback) {
  window.removeEventListener(HASH_CHANGE_EVENT, callback);
}

let Router = {
  routes: {
    search: require('./components/SearchPage.react'),
    settings: require('./components/SettingsPage.react')
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

  addRouteListener(callback) {
    addHashListener(callback);
  },

  removeRouteListener(callback) {
    removeHashListener(callback);
  },

  renderActualRoute() {
    let component = this.routes[this.getActualRoute()];

    this.renderPage(component);
  },

  init() {
    this.renderActualRoute();

    addHashListener(this.renderActualRoute.bind(this));
  }
};

module.exports = Router;
