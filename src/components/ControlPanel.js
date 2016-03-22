import React , { PropTypes } from 'react'
import ControlPanelHeader from './control-panel/ControlPanelHeader'
import { menuItems } from '../constants/MenuConstants'
import { block } from 'bem-generator'

const b = block('control-panel')

const ControlPanel = ({ children }) => (
  <div className={ b }>
    <ControlPanelHeader menuItems={ menuItems } />
    <div className={ b.element('content') }>
      { children }
    </div>
  </div>
)

ControlPanel.propTypes = {
  children: PropTypes.object.isRequired
}

export default ControlPanel
