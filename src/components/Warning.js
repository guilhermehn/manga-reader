import React, { PropTypes } from 'react'

const Warning = ({ title, message, onCancel, onProceed, cancelText='Cancel', proceedText='Continue' }) => (
  <div className='notice open-animation'>
    <h3><i className='zmdi zmdi-alert-triangle'></i> { title }</h3>
    <p>{ message }</p>
    <button type='button' className='btn-confirm' onClick={ onProceed }>{ proceedText }</button>
    <button type='button' onClick={ onCancel }>{ cancelText }</button>
  </div>
)

Warning.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onProceed: PropTypes.func.isRequired,
  cancelText: PropTypes.string,
  proceedText: PropTypes.string
}

export default Warning
