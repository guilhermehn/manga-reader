import React, { PropTypes } from 'react'
import _ from 'lodash'
import url from 'url'

import ReaderAPI from '../apis/ReaderAPI'
import SettingsAPI from '../apis/SettingsAPI'

import ReaderStore from '../stores/ReaderStore'
import SettingsStore from '../stores/SettingsStore'

import Reader from './reader/Reader'
import ProgressBar from './ProgressBar'
import ReaderNotice from './reader/ReaderNotice'
import ReaderHeader from './reader/ReaderHeader'
import PagesList from './reader/PagesList'
import ReaderFooter from './reader/ReaderFooter'

function pageDoneLoading() {
  ReaderAPI.pageDidLoad()
}

function createChapterUrl(pathname, number, query) {
  return {
    pathname: url.resolve(pathname, `${ number }`),
    query: query
  }
}

function getStateFromStores() {
  return {
    settings: SettingsStore.getSettings(),
    manga: ReaderStore.getManga(),
    doneLoadingManga: ReaderStore.doneLoadingManga(),
    loadedPagesCount: ReaderStore.getLoadedPagesCount()
  }
}

const ReaderPage = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  },

  getDefaultProps() {
    return {
      chapter: 1
    }
  },

  getInitialState() {
    return getStateFromStores(this.props.params.name)
  },

  loadManga() {
    const { name, chapter, source } = this.props.params
    const { method } = this.props.location.query

    ReaderAPI.loadMangaChapter(name, source, chapter, method)
  },

  componentDidMount() {
    SettingsStore.addChangeListener(this._onChange)
    ReaderStore.addChangeListener(this._onChange)
    SettingsAPI.loadSettings()
    this.loadManga()
  },

  componentWillUnmount() {
    SettingsStore.removeChangeListener(this._onChange)
    ReaderStore.removeChangeListener(this._onChange)
  },

  componentDidUpdate(prevProps) {
    const prevChapterNumber = prevProps.params.chapter
    const nextChapterNumber = this.props.params.chapter

    if (prevChapterNumber !== nextChapterNumber) {
      ReaderAPI.resetLoadedPagesCount()
      this.loadManga()
    }
  },

  _onChange() {
    this.setState(getStateFromStores(this.props.params.name))
  },

  render() {
    const { manga, doneLoadingManga, loadedPagesCount } = this.state

    if (!doneLoadingManga || !manga || !manga.hasOwnProperty('pages')) {
      let message = ''

      if (!doneLoadingManga) {
        message = 'Loading manga'
      }

      return (
        <Reader>
          <ReaderNotice message={ message } />
        </Reader>
      )
    }

    const { params, location } = this.props
    const chapterNumber = parseInt(params.chapter)
    const resolve = _.curry(createChapterUrl)(location.pathname, _, location.query)

    return (
      <Reader>
        <ProgressBar total={ manga.pages.length } progress={ loadedPagesCount } hideOnComplete={ true } />
        <ReaderHeader title={ manga.title } chapter={ params.chapter } />

        <PagesList pages={ manga.pages } onLoad={ pageDoneLoading } onError={ pageDoneLoading } />

        <ReaderFooter
          chapterNumber={ chapterNumber }
          prevChapterUrl={ resolve(chapterNumber - 1) }
          nextChapterUrl={ resolve(chapterNumber + 1) } />
      </Reader>
    )
  }
})

export default ReaderPage
