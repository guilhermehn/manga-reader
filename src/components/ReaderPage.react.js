let React = require('react');
let ReaderAPI = require('../apis/ReaderAPI');
let SettingsAPI = require('../apis/SettingsAPI');
let ReaderStore = require('../stores/ReaderStore');
let SettingsStore = require('../stores/SettingsStore');
let {History} = require('react-router');

function getStateFromStores() {
  return {
    settings: SettingsAPI.getSettings(),
    manga: ReaderStore.getManga(),
    doneLoadingManga: ReaderStore.doneLoadingManga()
  };
}

let ReaderPage = React.createClass({
  mixins: [History],

  getInitialState() {
    return getStateFromStores(this.props.params.name);
  },

  componentDidMount() {
    let {name, chapter} = this.props.params;
    let {method} = this.props.location.query;

    if (typeof chapter === 'undefined') {
      chapter = 1;
    }

    SettingsAPI.loadSettings();
    ReaderAPI.loadMangaChapter(name, chapter, method);

    SettingsStore.addChangeListener(this._onChange);
    ReaderStore.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
    SettingsStore.removeChangeListener(this._onChange);
    ReaderStore.removeChangeListener(this._onChange);
  },

  _onChange() {
    this.setState(getStateFromStores(this.props.params.name));
  },

  render() {
    let {manga, doneLoadingManga} = this.state;

    if (!doneLoadingManga || !manga || !manga.hasOwnProperty('pages')) {
      let message;

      if (!doneLoadingManga) {
        message = 'Loading manga...';
      }

      return (
        <div className='reader'>
          <div className='reader-notice'>
            {message}
          </div>
        </div>
      );
    }

    return (
      <div className='reader'>
        <div className='reader-header'>
          <h1>{manga.title}</h1>
        </div>

        <div className='reader-manga-pages'>
          {
            manga.pages.map((pageUrl, i) => {
              return (
                <div className='reader-manga-page' key={i}>
                  <img src={pageUrl} />
                </div>
              );
            })
          }

        </div>
      </div>
    );
  }
});

module.exports = ReaderPage;
