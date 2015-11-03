let React = require('react');

let ProgressBar = React.createClass({
  render() {
    let {total, progress} = this.props;
    let percent = (progress * 100) / total;

    let style = {
      width: `${percent.toFixed(2)}%`
    };

    return (
      <div className='progress-bar' title={`${Math.trunc(percent)}%`}>
        <div className='progress-bar-text'>{`${progress}/${total}`}</div>
        <div className='progress-bar-progress' style={style}></div>
      </div>
    );
  }
});

module.exports = ProgressBar;
