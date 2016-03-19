import React, { PropTypes } from 'react'

import SettingsSection from './SettingsSection'
import Checkbox from './Checkbox'
import RadioGroup from './RadioGroup'
import SettingsAPI from '../../apis/SettingsAPI'

function onSettingChange(setting, value) {
  if (typeof value !== 'undefined') {
    SettingsAPI.setOption(setting, value)
  }
}

const SettingsContent = ({ sections, settings }) => (
  <div>
    {
      sections.map(({ title, fields }) => (
        <SettingsSection key={ title } title={ title }>
          {
            fields.map((field) => {
              let value = settings[field.id]
              let { id } = field

              switch (field.type) {
              case 'checkbox': {
                return <Checkbox
                  id={ id }
                  key={ id }
                  label={ field.label }
                  onChange={ onSettingChange }
                  value={ value } />
              }

              case 'radio': {
                return <RadioGroup
                  id={ id }
                  key={ id }
                  options={ field.options }
                  onChange={ onSettingChange }
                  value={ value } />
              }
              }
            })
          }
        </SettingsSection>
      ))
    }
  </div>
)

SettingsContent.propTypes = {
  sections: PropTypes.array.isRequired,
  settings: PropTypes.object
}

export default SettingsContent
