import React, { PropTypes } from 'react'

const MigrationNotice = ({ onDismiss }) => (
  <div className='notice'>
    <p><strong>'All Mangas Reader' data was found. Import to the new format?</strong></p>
    <button type='button' className='btn-confirm'>Import</button>
    <button type='button' onClick={ onDismiss }>No</button>
  </div>
)

MigrationNotice.propTypes = {
  onDismiss: PropTypes.func.isRequired
}

export default MigrationNotice
