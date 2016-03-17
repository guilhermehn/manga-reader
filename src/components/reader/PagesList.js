import React, { PropTypes } from 'react'
import Page from './Page'

const PagesList = ({ pages, onLoad, onError }) => (
  <section className='reader-manga-pages'>
    {
      pages.map((pageUrl, i) =>
        <Page key={ i } src={ pageUrl } onLoad={ onLoad } onError={ onError } />)
    }
  </section>
)

PagesList.propTypes = {
  pages: PropTypes.array.isRequired,
  onLoad: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
}

export default PagesList
