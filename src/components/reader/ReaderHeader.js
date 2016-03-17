import React, { PropTypes } from 'react'

const ReaderHeader = ({ title, chapter }) => (
  <header className='reader-header'>
    <h1>{ title }{ chapter && ` - Chapter ${ chapter }` }</h1>
  </header>
)

ReaderHeader.propTypes = {
  title: PropTypes.string.isRequired,
  chapter: PropTypes.string
}

export default ReaderHeader
