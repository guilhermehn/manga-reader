import React from 'react'
import SearchAPI from '../apis/SearchAPI'

const SearchField = React.createClass({
  search() {
    let term = this.refs.searchTerm.value.trim()

    if (term === this.props.lastSearchTerm) {
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
  },

  handleKeyPress(e) {
    if (e.which === 13) {
      this.search()
    }
  },

  render() {
    let placeholder = this.props.placeholder || 'Search mangas by name...'

    return (
      <div className='search-field'>
        <input type='text' placeholder={ placeholder } onKeyPress={ this.handleKeyPress } className='search-input' ref='searchTerm' />
        <button title='Search' className='search-btn' onClick={ this.search }><i className='zmdi zmdi-lg zmdi-search'></i></button>
      </div>
    )
  }
})

export default SearchField
