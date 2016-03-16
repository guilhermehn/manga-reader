import AppDispatcher from '../dispatcher/AppDispatcher'
import { ACTION_TYPES } from '../constants/ReadingListConstants'

export default {
  loadReadingList(readingList) {
    AppDispatcher.dispatch({
      type: ACTION_TYPES.LOAD_READING_LIST,
      readingList: readingList
    })
  }
}
