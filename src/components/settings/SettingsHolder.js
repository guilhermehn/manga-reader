import React, { PropTypes } from 'react'

const SettingsHolder = ({ children }) => (
  <section className='page-content'>
    <h2>Settings</h2>
    { children }
  </section>
)

SettingsHolder.propTypes = {
  children: PropTypes.any
}

export default SettingsHolder
