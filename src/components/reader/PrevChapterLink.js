import React from 'react'
import MaterialIcon from 'react-material-iconic-font'
import ChapterLink from './ChapterLink'

const PrevChapterLink = (props) => (
  <ChapterLink {...props}>
    <span><MaterialIcon type='fast-rewind' /> Prev chapter</span>
  </ChapterLink>
)

export default PrevChapterLink
