import React, {PropTypes} from 'react';

const LoadingIcon = React.createClass({
  propTypes: {
    text: PropTypes.string
  },

  render() {
    let { text } = this.props;
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

export default LoadingIcon;
