let React = require('react');
let PropTypes = React.PropTypes;

let LoadingIcon = React.createClass({
  propTypes: {
    visible: PropTypes.bool.isRequired,
    text: PropTypes.string
  },

  render() {
    let {visible, text} = this.props;

    if (!visible) {
      return null;
    }

    return (
      <div className='loading-icon-holder'>
        <div className='loading-icon'><div></div></div>
        {(!!text && text.length) && <div className='loading-icon-text'>{this.props.text}</div> || null}
      </div>
    );
  }
});

module.exports = LoadingIcon;
