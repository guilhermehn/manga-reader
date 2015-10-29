let React = require('react'); // eslint-disable-line
let ControlPanelHeader = require('./ControlPanelHeader.react');

let ControlPanel = React.createClass({
  render() {
    return (
      <div className='control-panel'>
        <ControlPanelHeader />
        <div className='control-panel-content'>
          {this.props.children}
        </div>
      </div>
    );
  }
});

module.exports = ControlPanel;
