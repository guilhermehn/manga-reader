import React, { PropTypes } from 'react'
import MaterialIcon from 'react-material-iconic-font'
import Menu from './Menu'
import { block } from 'bem-generator'

const b = block('control-panel-header')

const HeaderComponent = ({ menuItems }) => (
  <header className={ b }>
    <div className={ b.element('content') }>
      <h1><MaterialIcon type='book' large /> Manga Reader</h1>
      <Menu items={ menuItems } />
    </div>
  </header>
)

HeaderComponent.propTypes = {
  menuItems: PropTypes.array.isRequired
}

export default HeaderComponent
