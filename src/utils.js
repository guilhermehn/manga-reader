import _ from 'lodash'

export const stopPropagation = (event) => event.stopPropagation()

export function getValueFromRadioGroup(name) {
  let radios = document.querySelectorAll(`input[name='${ name }']`)
  let checked = _.slice(radios).filter(radio => radio.checked)

  return checked.length === 1 ? checked[0].value : null
}
