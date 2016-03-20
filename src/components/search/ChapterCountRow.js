import React, { PropTypes } from 'react'
import moment from 'moment'

function formatDate(dateString) {
  return moment(new Date(dateString)).format('DD/MM/YYYY')
}

const ChapterCountRow = ({ date='', number }) => {
  if (date.length) {
    date = `(released in ${ formatDate(date) })`
  }

  return (
    <tr>
      <td>Chapters:</td>
      <td>{ number } { date }</td>
    </tr>
  )
}

ChapterCountRow.propTypes = {
  date: PropTypes.string,
  number: PropTypes.number.isRequired
}

export default ChapterCountRow
