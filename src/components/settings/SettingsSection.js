import React, { PropTypes } from 'react'

const SettingsSection = ({ title, children }) => (
  <section className='settings-section'>
    <h3>{ title }</h3>
    { children }
  </section>
)

SettingsSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.any
}

export default SettingsSection
