let React = require('react');
let PropTypes = React.PropTypes;

let LoadingIcon = React.createClass({
  propTypes: {
    text: PropTypes.string
  },

  render() {
    let {text} = this.props;

    return (
      <div className='loading-icon-holder'>
        <div className='loading-icon'><div></div></div>
        {(!!text && text.length) && <div className='loading-icon-text'>{this.props.text}</div> || null}
      </div>
    );
  }
});

module.exports = LoadingIcon;
