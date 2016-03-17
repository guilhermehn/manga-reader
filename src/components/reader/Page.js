import React, { PropTypes } from 'react'

const Page = ({ onLoad, src }) => (
  <div className='reader-manga-page'>
    <img src={ src } onLoad={ onLoad } onError={ onLoad } />
  </div>
)

Page.propTypes = {
  onLoad: PropTypes.func.isRequired,
  src: PropTypes.string.isRequired
}

export default Page
