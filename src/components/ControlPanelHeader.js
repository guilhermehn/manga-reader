import React from 'react'
import Menu from './Menu'
import { menuItems } from '../constants/MenuConstants'

const HeaderComponent = () => (
  <header className='control-panel-header'>
    <div className='control-panel-header-content'>
      <h1><i className='zmdi zmdi-book zmd-lg'></i> Manga Reader</h1>
      <Menu items={ menuItems } />
    </div>
  </header>
)

export default HeaderComponent
