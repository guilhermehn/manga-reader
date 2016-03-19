import React, { PropTypes } from 'react'

const Setting = ({ children }) => (
  <div className='settings-option'>
    { children }
  </div>
)

Setting.propTypes = {
  children: PropTypes.any
}

export default Setting
