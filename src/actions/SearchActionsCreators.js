import AppDispatcher from '../dispatcher/AppDispatcher'
import { ACTION_TYPES } from '../constants/SearchConstants'

export default {
  didSentSearch(term) {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.DID_SENT_SEARCH,
      term: term
    })
  },

  receiveSearchResults(results) {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.RECEIVE_SEARCH_RESULTS,
      results: results
    })
  },

  addSearchTermToHistory(term, dontEmit) {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.ADD_TERM_TO_HISTORY,
      term: term,
      dontEmit: !!dontEmit
    })
  },

  showSearchWarning() {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.SHOW_SEARCH_WARNING
    })
  },

  hideSearchWarning() {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.HIDE_SEARCH_WARNING
    })
  }
}
