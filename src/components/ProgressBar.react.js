import React, {PropTypes} from 'react';
import _ from 'lodash';

const ProgressBar = React.createClass({
  propTypes: {
    total: PropTypes.number.isRequired,
    progress: PropTypes.number.isRequired,
    showText: PropTypes.bool,
    onComplete: PropTypes.func,
    hideOnComplete: PropTypes.bool
  },

  getDefaultProps() {
    return {
      showText: false,
      hideOnComplete: false
    };
  },

  render() {
    let { total, progress, showText, onComplete, hideOnComplete } = this.props;
    let percent = (progress * 100) / total;
    let baseStyle = {};

    let barStyle = {
      width: `${percent.toFixed(2)}%`
    };

    if (total === progress) {
      if (_.isFunction(onComplete)) {
        onComplete();
      }

      if (hideOnComplete) {
        baseStyle.display = 'none';
      }
    }

    return (
      <div className='progress-bar' style={baseStyle} title={`${Math.trunc(percent)}%`}>
        {showText && <div className='progress-bar-text'>{`${progress}/${total}`}</div>}
        <div className='progress-bar-progress' style={barStyle}></div>
      </div>
    );
  }
});

export default ProgressBar;
