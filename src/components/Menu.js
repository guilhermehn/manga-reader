import React, { PropTypes } from 'react'
import { Link } from 'react-router'

const MenuItem = ({ route, iconClassname, title }) => (
  <li>
    <Link to={ `/${ route }` } className='menu-item' activeClassName='menu-item-active'>
      <span><i className={ `zmdi zmd-lg ${ iconClassname }` }></i>{ title }</span>
    </Link>
  </li>
)

MenuItem.propTypes = {
  route: PropTypes.string.isRequired,
  iconClassname: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
}

const Menu = ({ items }) => (
  <div className='menu'>
    <ul>{ items.map((item, i) => <MenuItem key={ i } { ...item } />) }</ul>
  </div>
)

Menu.propTypes = {
  items: PropTypes.array.isRequired
}

export default Menu
