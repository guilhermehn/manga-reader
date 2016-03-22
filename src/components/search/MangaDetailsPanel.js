import React, { PropTypes } from 'react'

import LoadingIcon from '../LoadingIcon'
import ChapterCountRow from './ChapterCountRow'
import ChapterSelector from './ChapterSelector'
import SourcesButtonList from './SourcesButtonList'
import AddToReadingListRow from './AddToReadingListRow'

import MangaAPI from '../../apis/MangaAPI'
import ReadingListAPI from '../../apis/ReadingListAPI'
import MangaStore from '../../stores/MangaStore'
import { byName } from '../../apis/parsers'
import { stopPropagation } from '../../utils'

function addToReadingList(manga) {
  return (e) => {
    stopPropagation(e)

    ReadingListAPI.addToReadingList(manga)
  }
}

function pluralize(str, length) {
  return length > 1 ? str : `${ str }s`
}

function getStateFromStores(manga) {
  return {
    mangaInfo: MangaStore.getMangaInfo(manga.title),
    selectedChapter: 1
  }
}

const MangaDetailsPanel = React.createClass({
  getInitialState() {
    return getStateFromStores(this.props.manga)
  },

  propTypes: {
    manga: PropTypes.object.isRequired,
    isInReadingList: PropTypes.bool.isRequired
  },

  componentDidMount() {
    MangaAPI.getMangaInfo(this.props.manga)
    MangaStore.addChangeListener(this._onChange)
  },

  componentWillUnmount() {
    MangaStore.removeChangeListener(this._onChange)
  },

  _onChange() {
    this.setState(getStateFromStores(this.props.manga))
  },

  handleChange(value) {
    this.setState({
      selectedChapter: value
    })
  },

  render() {
    let { mangaInfo, selectedChapter } = this.state

    if (!mangaInfo) {
      return (
        <LoadingIcon text='Requesting manga info' />
      )
    }

    let { manga, isInReadingList } = this.props
    let { lastChapter } = mangaInfo
    let chapterCountRow = null
    let separator = ', '

    if (lastChapter) {
      chapterCountRow = <ChapterCountRow number={ lastChapter.number } date={ lastChapter.date } />
    }

    return (
      <div className='info-panel open-animation'>
        <table>
          <tbody>
            <tr>
              <td>Release date:</td>
              <td>{ mangaInfo.releaseDate }</td>
            </tr>
            <tr>
              <td>{ pluralize('Author', mangaInfo.authors.length) }:</td>
              <td>{ mangaInfo.authors.join(separator) }</td>
            </tr>
            <tr>
              <td>{ pluralize('Artist', mangaInfo.artists.length) }:</td>
              <td>{ mangaInfo.artists.join(separator) }</td>
            </tr>
            <tr>
              <td>{ pluralize('Genre', mangaInfo.genres.length) }:</td>
              <td>{ mangaInfo.genres.join(separator) }</td>
            </tr>
            <tr>
              <td>Status:</td>
              <td>{ mangaInfo.status }</td>
            </tr>
            { chapterCountRow }
            <tr>
              <td><strong>Start reading:</strong></td>
              <td>
                <SourcesButtonList
                  chapter={ selectedChapter }
                  normalizedName={ manga.normalizedName }
                  sources={ manga.sources }
                  parsers={ byName } />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor='chapterSelector'>
                  <strong>Chapter:</strong>
                </label>
              </td>
              <td>
                <ChapterSelector
                  id='chapterSelector'
                  length={ lastChapter.number }
                  onChange={ this.handleChange } />
              </td>
            </tr>
            { !isInReadingList && <AddToReadingListRow onClick={ addToReadingList(manga) } />}
          </tbody>
        </table>
      </div>
    )
  }
})

export default MangaDetailsPanel
