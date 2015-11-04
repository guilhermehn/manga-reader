let React = require('react');
let MangaAPI = require('../apis/MangaAPI');
let ReaderAPI = require('../apis/ReaderAPI');
let MangaStore = require('../stores/MangaStore');
let PropTypes = React.PropTypes;
let LoadingIcon = require('./LoadingIcon.react');
let moment = require('moment');
let {Link} = require('react-router');
let utils = require('../utils');

function formatDate(dateString) {
  return moment(new Date(dateString)).format('DD/MM/YYYY');
}

function pluralize(str, length) {
  return length > 1 ? str : `${str}s`;
}

function getStateFromStores(manga) {
  return {
    mangaInfo: MangaStore.getMangaInfo(manga.title)
  };
}

let ChapterCountRow = React.createClass({
  render() {
    let {date, number} = this.props;
    let dateString = '';

    if (date) {
      dateString = `(released in ${formatDate(date)})`;
    }

    return(
      <tr>
        <td>Chapters:</td>
        <td>{number} {dateString}</td>
      </tr>
    );
  }
});

let MangaDetailsPanel = React.createClass({
  getInitialState() {
    return getStateFromStores(this.props.manga);
  },

  propTypes: {
    manga: PropTypes.object.isRequired
  },

  componentDidMount() {
    MangaAPI.getMangaInfo(this.props.manga);
    MangaStore.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
    MangaStore.removeChangeListener(this._onChange);
  },

  _onChange() {
    this.setState(getStateFromStores(this.props.manga));
  },

  render() {
    let {manga} = this.props;
    let {mangaInfo} = this.state;
    let separator = ', ';

    if (!mangaInfo) {
      return (
        <LoadingIcon text='Requesting manga info' />
      );
    }

    let chapterCountRow = null;

    if (mangaInfo.lastChapter) {
      chapterCountRow = <ChapterCountRow number={mangaInfo.lastChapter.number} date={mangaInfo.lastChapter.date} />;
    }

    return (
      <div className='info-panel open-animation'>
        <table>
          <tbody>
            <tr>
              <td>Release date:</td>
              <td>{mangaInfo.releaseDate}</td>
            </tr>
            <tr>
              <td>{pluralize('Author', mangaInfo.authors.length)}:</td>
              <td>{mangaInfo.authors.join(separator)}</td>
            </tr>
            <tr>
              <td>{pluralize('Artist', mangaInfo.artists.length)}:</td>
              <td>{mangaInfo.artists.join(separator)}</td>
            </tr>
            <tr>
              <td>{pluralize('Genre', mangaInfo.genres.length)}:</td>
              <td>{mangaInfo.genres.join(separator)}</td>
            </tr>
            <tr>
              <td>Status:</td>
              <td>{mangaInfo.status}</td>
            </tr>
            {chapterCountRow}
          </tbody>
        </table>
        <div className="info-panel-toolbar">
          <Link className='btn' onClick={utils.stopPropagation} to={`/reader/${manga.normalizedName}?method=search`}>Start reading</Link>
        </div>
      </div>
    );
  }
});

module.exports = MangaDetailsPanel;
