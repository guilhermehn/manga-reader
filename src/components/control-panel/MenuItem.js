import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import MaterialIcon from 'react-material-iconic-font'

const MenuItem = ({ route, icon, title, element }) => (
  <li>
    <Link to={ `/${ route }` } className={ element } activeClassName={ element.modifier('active') }>
      <span>
        <MaterialIcon type={ icon } large fixed />{ title }
      </span>
    </Link>
  </li>
)

MenuItem.propTypes = {
  route: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  element: PropTypes.object.isRequired
}

export default MenuItem
