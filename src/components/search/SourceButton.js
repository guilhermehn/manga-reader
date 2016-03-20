import React, { PropTypes } from 'react'
import { Link } from 'react-router'

const SourceButton = ({ url, iconUrl, name }) => (
  <Link className='btn info-panel-toolbar-link' to={ url }>
    <img className='info-panel-toolbar-source-icon' src={ iconUrl } />
    <span>{ name }</span>
  </Link>
)

SourceButton.propTypes = {
  url: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    query: PropTypes.object
  }).isRequired,
  iconUrl: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
}

export default SourceButton
