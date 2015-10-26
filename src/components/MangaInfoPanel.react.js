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
        <table>
          <tbody>
            <tr>
              <td>Release date:</td>
              <td>{mangaInfo.releaseDate}</td>
            </tr>
            <tr>
              <td>Author{mangaInfo.authors.length > 1 && 's'}:</td>
              <td>{mangaInfo.authors.join(separator)}</td>
            </tr>
            <tr>
              <td>Artist{mangaInfo.artists.length > 1 && 's'}:</td>
              <td>{mangaInfo.artists.join(separator)}</td>
            </tr>
            <tr>
              <td>Genre{mangaInfo.genres.length > 1 && 's'}:</td>
              <td>{mangaInfo.genres.join(separator)}</td>
            </tr>
            <tr>
              <td>Status:</td>
              <td>{mangaInfo.status}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = MangaInfoPanel;
