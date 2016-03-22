import React, { PropTypes } from 'react'
import MaterialIcon from 'react-material-iconic-font'

const AddToReadingListRow = ({ onClick }) => (
  <tr>
    <td />
    <td>
      <button onClick={ onClick }>
        <MaterialIcon type='playlist-plus' large /> Add to reading list
      </button>
    </td>
  </tr>
)

AddToReadingListRow.propTypes = {
  onClick: PropTypes.func.isRequired
}

export default AddToReadingListRow
