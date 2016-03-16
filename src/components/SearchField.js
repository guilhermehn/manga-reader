import React,  { PropTypes } from 'react'
import SearchAPI from '../apis/SearchAPI'

function search(term, lastSearchTerm) {
  if (term.length === 0 || term === lastSearchTerm) {
    return
  }

  if (term.length < 4) {
    SearchAPI.addSearchTermToHistory(term, true)
    SearchAPI.showSearchWarning()
    return
  }

  if (term.length) {
    SearchAPI.search(term)
  }
}

const SearchField = ({ lastSearchTerm }) => {
  let searchInput

  const setNode = (node) => {
    searchInput = node
  }

  const onClick = () => {
    search(searchInput.value.trim(), lastSearchTerm)
  }

  const onKeyPress = (event) => {
    if (event.which === 13) {
      onClick()
    }
  }

  return (
    <div className='search-field'>
      <input
        type='text'
        placeholder={ 'Search for mangas' }
        onKeyPress={ onKeyPress }
        className='search-input'
        ref={ setNode } />
      <button
        title='Search'
        className='search-btn'
        onClick={ onClick }>
        <i className='zmdi zmdi-lg zmdi-search'></i>
      </button>
    </div>
  )
}

SearchField.propTypes = {
  lastSearchTerm: PropTypes.string
}

export default SearchField
