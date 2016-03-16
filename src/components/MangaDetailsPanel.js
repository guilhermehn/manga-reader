import React, { PropTypes } from 'react'
import MangaAPI from '../apis/MangaAPI'
import MangaStore from '../stores/MangaStore'
import moment from 'moment'
import { Link } from 'react-router'
import { byName } from '../apis/parsers'
import LoadingIcon from './LoadingIcon'
import { stopPropagation } from '../utils'

function formatDate(dateString) {
  return moment(new Date(dateString)).format('DD/MM/YYYY')
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

let ChapterCountRow = React.createClass({
  render() {
    let { date, number } = this.props
    let dateString = ''

    if (date) {
      dateString = `(released in ${ formatDate(date) })`
    }

    return (
      <tr>
        <td>Chapters:</td>
        <td>{ number } { dateString }</td>
      </tr>
    )
  }
})

let ChapterSelector = React.createClass({
  propTypes: {
    length: PropTypes.number.isRequired
  },

  render() {
    let { length } = this.props
    let options = new Array(length)

    for (let i = 0; i < length; i++) {
      let value = i + 1
      options[i] = <option key={ i } value={ value }>{ value }</option>
    }

    return (
      <select onChange={ this.props.onChange } onClick={ stopPropagation }>
        { options }
      </select>
    )
  }
})

let MangaDetailsPanel = React.createClass({
  getInitialState() {
    return getStateFromStores(this.props.manga)
  },

  propTypes: {
    manga: PropTypes.object.isRequired
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

  handleChange(e) {
    this.setState({
      selectedChapter: e.target.value
    })
  },

  render() {
    let { mangaInfo, selectedChapter } = this.state

    if (!mangaInfo) {
      return (
        <LoadingIcon text='Requesting manga info' />
      )
    }

    let { manga } = this.props
    let chapterCountRow = null
    let separator = ', '
    let { lastChapter } = mangaInfo

    if (lastChapter) {
      chapterCountRow = <ChapterCountRow number={ lastChapter.number } date={ lastChapter.date } />
    }

    let sourcesList = manga.sources.map((source, i) => {
      let { name } = source
      let url = {
        pathname: `/reader/${ manga.normalizedName }/${ name }/${ selectedChapter }`,
        query: {
          method: 'search'
        }
      }

      return (
        <Link key={ i } className='btn info-panel-toolbar-link' to={ url }>
          <img className='info-panel-toolbar-source-icon' src={ byName[name].icon } />
          <span>{ name }</span>
        </Link>
      )
    })

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
                { sourcesList }
                <strong>Chapter</strong>
                <ChapterSelector length={ lastChapter.number } onChange={ this.handleChange } />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
})

module.exports = MangaDetailsPanel
