import React, { PropTypes } from 'react'
import Setting from './Setting'
import { getValueFromRadioGroup } from '../../utils'

function createChangeHandler(id, onChange) {
  return () => {
    let value = getValueFromRadioGroup(id)
    onChange(id, value)
  }
}

const RadioGroup = ({ id, value, options, onChange }) => (
  <Setting>
    {
      options.map((option) => {
        let key = `${ id }_${ option.value }`

        return (
          <label htmlFor={ key } key={ key }>
            <input
              type='radio'
              id={ key }
              name={ id }
              defaultChecked={ option.value === value }
              onChange={ createChangeHandler(id, onChange) }
              value={ option.value } />
              { option.label }
          </label>
        )
      })
    }
  </Setting>
)

RadioGroup.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func
}

export default RadioGroup
