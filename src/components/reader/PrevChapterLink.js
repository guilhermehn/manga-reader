import React from 'react'
import ChapterLink from './ChapterLink'

const PrevChapterLink = (props) => (
  <ChapterLink {...props}>
    <span><i className='zmdi zmdi-fast-rewind'></i> Prev chapter</span>
  </ChapterLink>
)

export default PrevChapterLink
