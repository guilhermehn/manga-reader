import React from 'react'
import EmptyReadingList from './reading-list/EmptyReadingList'
import ReadingList from './reading-list/ReadingList'

import ReadingListAPI from '../apis/ReadingListAPI'
import ReadingListStore from '../stores/ReadingListStore'

function getStateFromStores() {
  return {
    items: ReadingListStore.getReadingList()
  }
}

const ReadingListPage = React.createClass({
  getInitialState() {
    return getStateFromStores()
  },

  componentDidMount() {
    ReadingListStore.addChangeListener(this._onChange)
    ReadingListAPI.loadReadingList()
  },

  componentWillUnmount() {
    ReadingListStore.removeChangeListener(this._onChange)
  },

  _onChange() {
    this.setState(getStateFromStores())
  },

  render() {
    let content

    if (this.state.items.length) {
      content = <ReadingList items={ this.state.items } />
    }
    else {
      content = <EmptyReadingList />
    }

    return (
      <div className='reading-list-page'>
        <div className='reading-list-page-content'>
          { content }
        </div>
      </div>
    )
  }
})

export default ReadingListPage
