import React, { PropTypes } from 'react'
import MenuItem from './MenuItem'
import { block } from 'bem-generator'

const Menu = ({ items }) => {
  const b = block('menu')
  const el = b.element('item')

  return (
    <div className={ b }>
      <ul>
        {
          items.map((item, i) =>
            <MenuItem key={ i } element={ el } { ...item } />)
        }
      </ul>
    </div>
  )
}

Menu.propTypes = {
  items: PropTypes.array.isRequired
}

export default Menu
