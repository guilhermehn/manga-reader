import SearchActionsCreators from '../actions/SearchActionsCreators'
import ParsersAPI from './ParsersAPI'

const SearchAPI = {
  search(term) {
    SearchActionsCreators.didSentSearch(term)

    ParsersAPI.search(term, (results) => {
      SearchActionsCreators.receiveSearchResults(results)
    })
  },

  addSearchTermToHistory(term, dontEmit) {
    SearchActionsCreators.addSearchTermToHistory(term, dontEmit)
  },

  showSearchWarning() {
    SearchActionsCreators.showSearchWarning()
  },

  hideSearchWarning() {
    SearchActionsCreators.hideSearchWarning()
  }
}

export default SearchAPI
