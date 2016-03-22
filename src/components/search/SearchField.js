import React,  { PropTypes } from 'react'
import MaterialIcon from 'react-material-iconic-font'
import SearchAPI from '../../apis/SearchAPI'

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

  const ref = (node) => {
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
        ref={ ref } />
      <button
        title='Search'
        className='search-btn'
        onClick={ onClick }>
        <MaterialIcon type='search' large />
      </button>
    </div>
  )
}

SearchField.propTypes = {
  lastSearchTerm: PropTypes.string
}

export default SearchField
