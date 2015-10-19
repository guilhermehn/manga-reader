'use strict';

let React = require('react');
let {
  DEFAULT_ROUTE,
  MENU_ITEMS
} = require('../Constants');

let MenuItemComponent = React.createClass({
  render() {
    let {selected, route, iconClassname, title} = this.props;
    let url = selected ? '#' : `#/${route}`;

    return (
      <li className={selected ? 'selected' : ''}>
        <a href={url}><i className={`zmdi zmd-lg ${iconClassname}`}></i>{title}</a>
      </li>
    );
  }
});

let MenuComponent = React.createClass({
  getInitialState() {
    return {
      actualRoute: DEFAULT_ROUTE
    };
  },

  render() {
    let menuItems = MENU_ITEMS.map((item, i) => {
      return <MenuItemComponent selected={item.route === item.actualRoute} key={i} {...item} />;
    });

    return <ul>{menuItems}</ul>;
  }
});

module.exports = MenuComponent;
