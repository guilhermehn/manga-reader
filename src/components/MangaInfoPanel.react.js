let React = require('react');
let MangaAPI = require('../apis/MangaAPI');
let MangaStore = require('../stores/MangaStore');
let PropTypes = React.PropTypes;
let LoadingIcon = require('./LoadingIcon.react');

function getStateFromStores(manga) {
  return {
    mangaInfo: MangaStore.getMangaInfo(manga.title)
  };
}

let MangaInfoPanel = React.createClass({
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

    return (
      <div className='info-panel'>
        Release date: {mangaInfo.releaseDate}<br />
        Author{mangaInfo.authors.length > 1 && 's'}: {mangaInfo.authors.join(separator)}<br />
        Artist{mangaInfo.artists.length > 1 && 's'}: {mangaInfo.artists.join(separator)}<br />
        Genre{mangaInfo.genres.length > 1 && 's'}: {mangaInfo.genres.join(separator)}<br />
        Status: {mangaInfo.status}<br />
      </div>
    );
  }
});

module.exports = MangaInfoPanel;
