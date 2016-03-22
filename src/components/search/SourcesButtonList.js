import React, { PropTypes } from 'react'
import SourceButton from './SourceButton'

function createUrlObject(normalizedName, name, chapter) {
  return {
    pathname: `/reader/${ normalizedName }/${ name }/${ chapter }`,
    query: {
      method: 'search'
    }
  }
}

const SourcesButtonList = ({ chapter, normalizedName, sources, parsers }) => (
  <div className='sources-list'>
    {
      sources.map((source, i) => {
        let { name } = source
        let url = createUrlObject(normalizedName, name, chapter)

        return <SourceButton
          key={ i }
          url={ url }
          iconUrl={ parsers[name].icon }
          name={ name } />
      })
    }
  </div>
)

SourcesButtonList.propTypes = {
  chapter: PropTypes.number.isRequired,
  normalizedName: PropTypes.string.isRequired,
  sources: PropTypes.array.isRequired,
  parsers: PropTypes.object.isRequired
}

export default SourcesButtonList
