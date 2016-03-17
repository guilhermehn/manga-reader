import React, { PropTypes } from 'react'
import LoadingIcon from '../LoadingIcon'

const ReaderNotice = ({ message }) => (
  <div className='reader-notice open-animation'>
    <LoadingIcon text={ message } />
  </div>
)

ReaderNotice.propTypes = {
  message: PropTypes.string
}

export default ReaderNotice
