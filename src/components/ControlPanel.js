import React from 'react'
import ControlPanelHeader from './ControlPanelHeader'

const ControlPanel = React.createClass({
  render() {
    return (
      <div className='control-panel'>
        <ControlPanelHeader />
        <div className='control-panel-content'>
          { this.props.children }
        </div>
      </div>
    )
  }
})

export default ControlPanel
