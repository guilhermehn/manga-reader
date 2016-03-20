import React, { PropTypes } from 'react'
import { stopPropagation } from '../../utils'

const ChapterSelector = ({ length, onChange }) => {
  let select

  const ref = (node) => {
    select = node
  }

  let options = new Array(length)

  for (let i = 0; i < length; i++) {
    let value = i + 1
    options[i] = <option key={ i } value={ value }>{ value }</option>
  }

  return (
    <select ref={ ref } onChange={ () => { onChange(select.value) } } onClick={ stopPropagation }>
      { options }
    </select>
  )
}

ChapterSelector.propTypes = {
  length: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
}

export default ChapterSelector
