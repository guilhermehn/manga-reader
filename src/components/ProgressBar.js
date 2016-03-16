import React, { PropTypes } from 'react'

const ProgressBar = ({ total, progress, showText = false, onComplete, hideOnComplete = false }) => {
  let percent = (progress * 100) / total
  let style = {}
  let barStyle = {
    width: `${ percent.toFixed(2) }%`
  }

  if (total === progress) {
    if (onComplete) {
      onComplete()
    }

    if (hideOnComplete) {
      style.display = 'none'
    }
  }

  return (
    <div className='progress-bar' style={ style } title={ `${ Math.trunc(percent) }%` }>
      { showText && <div className='progress-bar-text'>{ `${ progress }/${ total }` }</div> }
      <div className='progress-bar-progress' style={ barStyle }></div>
    </div>
  )
}

ProgressBar.propTypes = {
  total: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
  showText: PropTypes.bool,
  onComplete: PropTypes.func,
  hideOnComplete: PropTypes.bool
}

export default ProgressBar
