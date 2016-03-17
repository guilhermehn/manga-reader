import React, { PropTypes } from 'react'
import { Link } from 'react-router'

const ChapterLink = ({ to, children }) => (
  <Link className='btn' to={ to }>
    { children }
  </Link>
)

ChapterLink.propTypes = {
  to: PropTypes.object.isRequired,
  children: React.PropTypes.element.isRequired
}

export default ChapterLink
