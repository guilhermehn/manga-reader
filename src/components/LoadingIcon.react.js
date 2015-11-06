let React = require('react');
let PropTypes = React.PropTypes;

let LoadingIcon = React.createClass({
  propTypes: {
    text: PropTypes.string
  },

  render() {
    let {text} = this.props;
    let textElement = null;

    if (!!text && text.length) {
      textElement = <div className='loading-icon-text'>{text}</div>;
    }

    return (
      <div className='loading-icon-holder'>
        <div className='loading-icon'><div></div></div>
        {textElement}
      </div>
    );
  }
});

module.exports = LoadingIcon;
