import React, { PropTypes } from 'react'
import MangaDetailsPanel from './MangaDetailsPanel'
import MaterialIcon from 'react-material-iconic-font'

const SearchResultsRow = ({ manga, handleClick, infoExpanded = false, isInReadingList = false }) => {
  let readingCheck = null
  let title

  if (isInReadingList) {
    let icon = <MaterialIcon type='check' />

    if (!infoExpanded) {
      readingCheck = (
        <span>
          {icon}
        </span>
      )
    }
    else {
      readingCheck = (
        <div className='reading-list-check'>
          {icon} In reading list
        </div>
      )
    }
  }

  if (infoExpanded) {
    title = <h3 className='info-panel-title'>{ manga.title }</h3>
  }
  else {
    title = <span className='search-results-table-title'>{ manga.title }</span>
  }

  return (
    <tr onClick={ handleClick }>
      <td>
        { readingCheck }
        { title }
        { infoExpanded && <MangaDetailsPanel manga={ manga } isInReadingList={ isInReadingList } /> }
      </td>
    </tr>
  )
}

SearchResultsRow.propTypes = {
  manga: PropTypes.object.isRequired,
  handleClick: PropTypes.func.isRequired,
  infoExpanded: PropTypes.bool,
  isInReadingList: PropTypes.bool
}

export default SearchResultsRow
