import React, { PropTypes } from 'react'
import MangaDetailsPanel from './MangaDetailsPanel'

const SearchResultsRow = React.createClass({
  propTypes: {
    manga: PropTypes.object.isRequired,
    infoExpanded: PropTypes.bool.isRequired,
    handleClick: PropTypes.func,
    isInReadingList: PropTypes.bool
  },

  getDefaultProps() {
    return {
      infoExpanded: false,
      isInReadingList: false,
      handleClick() {}
    }
  },

  render() {
    let {
      manga,
      infoExpanded,
      handleClick,
      isInReadingList
    } = this.props

    let readingCheck = null

    if (isInReadingList) {
      if (!infoExpanded) {
        readingCheck = (
          <span>
            <i className='zmdi zmdi-check'></i>{ ' ' }
          </span>
        )
      }
      else {
        readingCheck = (
          <div className='reading-list-check'>
            <i className='zmdi zmdi-check'></i> In reading list
          </div>
        )
      }
    }

    return (
      <tr onClick={ handleClick }>
        <td>
          { readingCheck }
          { infoExpanded ? <h3 className='info-panel-title'>{ manga.title }</h3> : manga.title }
          { infoExpanded && <MangaDetailsPanel manga={ manga } /> }
        </td>
      </tr>
    )
  }
})

export default SearchResultsRow
