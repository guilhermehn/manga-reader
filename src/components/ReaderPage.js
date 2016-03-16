import React from 'react'
import _ from 'lodash'
import ReaderAPI from '../apis/ReaderAPI'
import SettingsAPI from '../apis/SettingsAPI'
import ReaderStore from '../stores/ReaderStore'
import SettingsStore from '../stores/SettingsStore'
import LoadingIcon from './LoadingIcon'
import ProgressBar from './ProgressBar'
import { Link } from 'react-router'
import url from 'url'

const Page = React.createClass({
  handleLoad() {
    this.props.onLoad(null)
  },

  handleError(e) {
    this.props.onLoad(e)
  },

  render() {
    return (
      <div className='reader-manga-page'>
        <img src={ this.props.src } onLoad={ this.handleLoad } onError={ this.handleError } />
      </div>
    )
  }
})

function getStateFromStores() {
  return {
    settings: SettingsStore.getSettings(),
    manga: ReaderStore.getManga(),
    doneLoadingManga: ReaderStore.doneLoadingManga(),
    loadedPagesCount: ReaderStore.getLoadedPagesCount()
  }
}

function createChapterUrl(pathname, number, query) {
  return {
    pathname: url.resolve(pathname, `${ number }`),
    query: query
  }
}

const ReaderPage = React.createClass({
  propTypes: {
    params: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired
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

  tickProgressBar() {
    ReaderAPI.pageDidLoad()
  },

  _onChange() {
    this.setState(getStateFromStores(this.props.params.name))
  },

  render() {
    const { manga, doneLoadingManga, loadedPagesCount } = this.state

    if (!doneLoadingManga || !manga || !manga.hasOwnProperty('pages')) {
      let message

      if (!doneLoadingManga) {
        message = 'Loading manga'
      }

      return (
        <div className='reader'>
          <div className='reader-notice open-animation'>
            <LoadingIcon text={ message } />
          </div>
        </div>
      )
    }

    const { params, location } = this.props
    const chapterNumber = parseInt(params.chapter)
    const resolve = _.curry(createChapterUrl)(location.pathname, _, location.query)

    const prevChapterLink = (
      <Link className='btn' to={ resolve(chapterNumber - 1) }>
          <i className='zmdi zmdi-fast-rewind'></i> Prev chapter
      </Link>
    )

    const nextChapterLink = (
      <Link className='btn' to={ resolve(chapterNumber + 1) }>
        Next chapter <i className='zmdi zmdi-fast-forward'></i>
      </Link>
    )

    return (
      <div className='reader'>
        <ProgressBar total={ manga.pages.length } progress={ loadedPagesCount } hideOnComplete={ true } />
        <header className='reader-header'>
          <h1>{ manga.title } - Chapter { params.chapter }</h1>
        </header>

        <section className='reader-manga-pages'>
          {
            manga.pages.map((pageUrl, i) =>
              <Page key={ i } src={ pageUrl } onLoad={ this.tickProgressBar } onError={ this.tickProgressBar } />)
          }
        </section>

        <nav className='reader-nav'>
          { params.chapter > 1 && prevChapterLink }
          <strong>End of chapter { chapterNumber }</strong>
          { nextChapterLink }
        </nav>
      </div>
    )
  }
})

export default ReaderPage
