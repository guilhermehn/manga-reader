import React, { PropTypes } from 'react'

import PrevChapterLink from './PrevChapterLink'
import NextChapterLink from './NextChapterLink'

const ReaderFooter = ({ chapterNumber, prevChapterUrl, nextChapterUrl }) => (
  <footer>
    <nav className='reader-nav'>
      { chapterNumber > 1 && <PrevChapterLink to={ prevChapterUrl } /> }
      <strong>End of chapter { chapterNumber }</strong>
      { <NextChapterLink to={ nextChapterUrl } /> }
    </nav>
  </footer>
)

ReaderFooter.propTypes = {
  chapterNumber: PropTypes.number.isRequired,
  prevChapterUrl: PropTypes.object.isRequired,
  nextChapterUrl: PropTypes.object.isRequired
}

export default ReaderFooter
