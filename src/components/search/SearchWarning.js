import React, { PropTypes } from 'react'
import Warning from '../Warning'
import SearchAPI from '../../apis/SearchAPI'

function proceed(term) {
  SearchAPI.search(term)
  SearchAPI.hideSearchWarning()
}

function cancel() {
  SearchAPI.hideSearchWarning()
}

const SearchWarning = ({ term }) => (
  <Warning
    title='Searching for less than 4 letters will be slow'
    message='Do you really want to continue?'
    onProceed={ () => { proceed(term) } }
    onCancel={ cancel }
    />
)

SearchWarning.propTypes = {
  term: PropTypes.string.isRequired
}

export default SearchWarning
