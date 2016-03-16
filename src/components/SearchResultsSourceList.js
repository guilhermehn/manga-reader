import React, { PropTypes } from 'react'
import parsers from '../apis/parsers'
import { stopPropagation } from '../utils'

const SearchResultsSourceListItem = ({ url, name, title }) => {
  <a
    href={ url }
    target='_blank'
    title={ `Read '${ title }' from ${ name }` }
    onClick={ stopPropagation }>
    <img src={ parsers.byName[name].icon } />
  </a>
}

const SearchResultsSourceList = ({ title, sources }) => {
  return (
    <span className='ta-right'>
      {
        sources.map((source, i) =>
          <SearchResultsSourceListItem {...source} key={ i } title={ title } />)
      }
    </span>
  )
}

SearchResultsSourceList.propTypes = {
  title: PropTypes.string,
  sources: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string,
    name: PropTypes.string
  }))
}

export default SearchResultsSourceList
