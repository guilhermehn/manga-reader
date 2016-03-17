import React, { PropTypes } from 'react'

const Reader = ({ children }) => (
  <div className='reader'>
    { children }
  </div>
)

Reader.propTypes = {
  children: PropTypes.any
}

export default Reader
