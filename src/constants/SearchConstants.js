import keyMirror from 'keymirror'

const ACTION_TYPES = keyMirror({
  RECEIVE_SEARCH_RESULTS: null,
  DID_SENT_SEARCH: null,
  ADD_TERM_TO_HISTORY: null,
  SHOW_SEARCH_WARNING: null,
  HIDE_SEARCH_WARNING: null
})

export { ACTION_TYPES }
