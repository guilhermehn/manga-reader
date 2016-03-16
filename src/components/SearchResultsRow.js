import React from 'react'
import MangaDetailsPanel from './MangaDetailsPanel'

const SearchResultsRow = React.createClass({
  getDefaultProps() {
    return {
      infoExpanded: false,
      isInReadingList: false,
      handleClick() {}
    }
  },

  componentDidUpdate(oldProps, newProps) {
    let propsOk = oldProps && newProps

    if (propsOk
      && oldProps.manga
      && newProps.manga
      && oldProps.manga.normalizedName !== newProps.manga.normalizedName) {
      this.setState({
        infoExpanded: false
      })
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
