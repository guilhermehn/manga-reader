import React, { PropTypes } from 'react'
import Setting from './Setting'

const Checkbox = ({ id, label, value, onChange }) => {
  let ref

  const createChangeHandler = (id, onChange) => () => {
    onChange(id, ref.checked)
  }

  return (
    <Setting>
      <label htmlFor={ id }>
        <input
          type='checkbox'
          name={ id }
          id={ id }
          defaultChecked={ value }
          ref={ (node) => { ref = node } }
          onChange={ createChangeHandler(id, onChange) } />
        { label }
      </label>
    </Setting>
  )
}

Checkbox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func
}

export default Checkbox
