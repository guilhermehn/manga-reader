import React from 'react'
import ChapterLink from './ChapterLink'

const NextChapterLink = (props) => (
  <ChapterLink {...props}>
    <span>Next chapter <i className='zmdi zmdi-fast-forward'></i></span>
  </ChapterLink>
)

export default NextChapterLink
