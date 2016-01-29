import React from 'react';
import {Link} from 'react-router';

const MenuItem = React.createClass({
  render() {
    let { route, iconClassname, title } = this.props;

    return (
      <li>
        <Link to={`/${route}`} className='menu-item' activeClassName='menu-item-active'>
          <span><i className={`zmdi zmd-lg ${iconClassname}`}></i>{title}</span>
        </Link>
      </li>
    );
  }
});

const Menu = React.createClass({
  render() {
    let menuItems = this.props.items.map((item, i) =>
      <MenuItem key={i} {...item} />);

    return (
      <div className='menu'>
        <ul>{menuItems}</ul>
      </div>
    );
  }
});

export default Menu;
