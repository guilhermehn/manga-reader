'use strict';

let React = require('react');
let classnames = require('classnames');
let Router = require('../Router');
let {
  MENU_ITEMS
} = require('../Constants');

let MenuItemComponent = React.createClass({
  handleClick(e) {
    this.refs.link.click(e);
  },

  render() {
    let {active, route, iconClassname, title} = this.props;
    let url = active ? '#' : `#/${route}`;
    let linkClassNames = classnames({
      active: active
    });

    return (
      <li className={linkClassNames} onClick={this.handleClick}>
        <a href={url} ref='link'><i className={`zmdi zmd-lg ${iconClassname}`}></i>{title}</a>
      </li>
    );
  }
});

function getStateFromRouter() {
  return {
    actualRoute: Router.getActualRoute()
  };
}

let MenuComponent = React.createClass({
  getInitialState() {
    return getStateFromRouter();
  },

  componentDidMount() {
    Router.addRouteListener(this._onChange);
  },

  componentWillUnmount() {
    Router.removeRouteListener(this._onChange);
  },

  _onChange() {
    this.setState(getStateFromRouter());
  },

  render() {
    let {actualRoute} = this.state;

    let menuItems = MENU_ITEMS.map((item, i) =>
      <MenuItemComponent active={item.route === actualRoute} key={i} {...item} />);

    return <ul>{menuItems}</ul>;
  }
});

module.exports = MenuComponent;
