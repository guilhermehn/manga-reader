import React, { PropTypes } from 'react'
import SearchAPI from '../apis/SearchAPI'

function proceed() {
  SearchAPI.search(this.props.term)
  SearchAPI.hideSearchWarning()
}

function cancel() {
  SearchAPI.hideSearchWarning()
}

const SearchWarning = () => (
  <div className='notice open-animation'>
    <h3><i className='zmdi zmdi-alert-triangle'></i> Searching for less than 4 letters will be slow.</h3>
    <p>Do you really want to continue?</p>
    <button type='button' className='btn-confirm' onClick={ proceed }>Continue</button>
    <button type='button' onClick={ cancel }>Cancel</button>
  </div>
)

SearchWarning.propTypes = {
  term: PropTypes.string
}

export default SearchWarning
