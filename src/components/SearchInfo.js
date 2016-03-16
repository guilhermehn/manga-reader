import React, { PropTypes } from 'react'

const SearchInfo = ({ resultsLength, term }) => (
  <div className='search-info'>
    { resultsLength } mangas were found for { `'${ term }'` }
  </div>
)

SearchInfo.propTypes = {
  resultsLength: PropTypes.number.isRequired,
  term: PropTypes.string.isRequired
}

export default SearchInfo
