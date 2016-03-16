import React , { PropTypes } from 'react'
import ControlPanelHeader from './ControlPanelHeader'

const ControlPanel = ({ children }) => (
  <div className='control-panel'>
    <ControlPanelHeader />
    <div className='control-panel-content'>
      { children }
    </div>
  </div>
)

ControlPanel.propTypes = {
  children: PropTypes.object.isRequired
}

export default ControlPanel
