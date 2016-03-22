import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import moment from 'moment'
import MaterialIcon from 'react-material-iconic-font'

import ProgressBar from '../ProgressBar'
import { getParserIcon } from '../../apis/parsers'

function isDone({ lastReadChapter = false , lastChapter = false }) {
  return lastReadChapter !== false
    && lastChapter !== false
    && lastReadChapter === lastChapter.number
}

const ReadingListItem = ({ item }) => {
  let done = isDone(item)
  let lastChapterDate = new Date(item.lastChapter.date)
  let newChapterSinceLastRead = lastChapterDate > new Date(item.lastReadDate)
  let newChapterLabel = null

  if (newChapterSinceLastRead) {
    let lastChapterReleaseDate = moment(lastChapterDate)
    let newChapterLabelTitle = `Chapter ${ item.lastChapter.number } was released at ${ lastChapterReleaseDate.format('MMM, DD YYYY') }`

    newChapterLabel = (
      <span className='reading-list-item-alert' title={ newChapterLabelTitle }>New Chapter!</span>
    )
  }

  let nextChapterNumber = item.lastReadChapter + 1
  let nextChapterUrl = `/reader/${ item.normalizedName }/${ item.source.name }/${ nextChapterNumber }`

  return (
    <div className='reading-list-item'>
      <h3>{ item.title } { newChapterSinceLastRead && newChapterLabel }</h3>

      <div className='reading-list-item-source'>
        <img src={ getParserIcon(item.source.name) } />
      </div>

      <div className='reading-list-item-progress'>
        <ProgressBar
          total={ item.lastChapter.number }
          progress={ item.lastReadChapter }
          showText={ true } />
      </div>

      <div className='reading-list-item-toolbar'>
        <div className='reading-list-item-toolbar-left'>
          { !done && <Link className='btn btn-primary' to={ nextChapterUrl }>Read chapter <strong>{ nextChapterNumber }</strong></Link> }
          { (done && item.status === 'complete') && <strong>Complete</strong> }
        </div>

        <div className='reading-list-item-toolbar-right'>
          {
            !done &&
              <button type='button' className='btn-primary' title='Mark as complete'>
                <MaterialIcon type='check-all' />
              </button>
          }
          <button type='button' className='btn-danger' title='Delete'>
            <MaterialIcon type='close' />
          </button>
        </div>
      </div>
    </div>
  )
}

ReadingListItem.propTypes = {
  item: PropTypes.object.isRequired
}

export default ReadingListItem
