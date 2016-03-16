import React, { PropTypes } from 'react'

const EmptySearchResult = ({ term }) => (
  <strong>No manga contains the search term '{ term }'</strong>
)

EmptySearchResult.propTypes = {
  term: PropTypes.string.isRequired
}

export default EmptySearchResult
