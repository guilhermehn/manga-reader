import React, { PropTypes } from 'react'
import ReadingListItem from './ReadingListItem'

const ReadingList = ({ items }) => (
  <div className='reading-list-items'>
    {
      items.map((item, i) =>
        <ReadingListItem item={ item } key={ i } />)
    }
  </div>
)

ReadingList.propTypes = {
  items: PropTypes.array.isRequired
}

export default ReadingList
