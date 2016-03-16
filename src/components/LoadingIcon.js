import React, { PropTypes } from 'react'

const LoadingIcon = ({ text }) => {
  let textElement = null

  if (!!text && text.length) {
    textElement = <div className='loading-icon-text'>{ text }</div>
  }

  return (
    <div className='loading-icon-holder'>
      <div className='loading-icon'><div></div></div>
      { textElement }
    </div>
  )
}

LoadingIcon.propTypes = {
  text: PropTypes.string
}

export default LoadingIcon
