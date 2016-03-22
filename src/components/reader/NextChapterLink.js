import React from 'react'
import ChapterLink from './ChapterLink'
import MaterialIcon from 'react-material-iconic-font'

const NextChapterLink = (props) => (
  <ChapterLink {...props}>
    <span>Next chapter <MaterialIcon type='fast-forward' /></span>
  </ChapterLink>
)

export default NextChapterLink
