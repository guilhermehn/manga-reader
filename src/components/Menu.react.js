let React = require('react');
let {Link} = require('react-router');

let MenuItem = React.createClass({
  render() {
    let {route, iconClassname, title} = this.props;

    return (
      <li>
        <Link to={`/${route}`} className='menu-item' activeClassName='menu-item-active'>
          <i className={`zmdi zmd-lg ${iconClassname}`}></i>{title}
        </Link>
      </li>
    );
  }
});

let Menu = React.createClass({
  render() {
    let menuItems = this.props.items.map((item, i) =>
      <MenuItem key={i} {...item} />);

    return (
      <div className="menu">
        <ul>{menuItems}</ul>
      </div>
    );
  }
});

module.exports = Menu;
