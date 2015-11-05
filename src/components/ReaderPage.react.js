let React = require('react');
let ReaderAPI = require('../apis/ReaderAPI');
let SettingsAPI = require('../apis/SettingsAPI');
let ReaderStore = require('../stores/ReaderStore');
let SettingsStore = require('../stores/SettingsStore');
let {Link, History} = require('react-router');
let url = require('url');

function getStateFromStores() {
  return {
    settings: SettingsStore.getSettings(),
    manga: ReaderStore.getManga(),
    doneLoadingManga: ReaderStore.doneLoadingManga()
  };
}

let ReaderPage = React.createClass({
  mixins: [History],

  getInitialState() {
    return getStateFromStores(this.props.params.name);
  },

  loadManga() {
    let {name, chapter, source} = this.props.params;
    let {method} = this.props.location.query;

    if (typeof chapter === 'undefined') {
      chapter = 1;
    }

    ReaderAPI.loadMangaChapter(name, source, chapter, method);
  },

  componentDidMount() {
    SettingsStore.addChangeListener(this._onChange);
    ReaderStore.addChangeListener(this._onChange);
    SettingsAPI.loadSettings();
    this.loadManga();
  },

  componentWillUnmount() {
    SettingsStore.removeChangeListener(this._onChange);
    ReaderStore.removeChangeListener(this._onChange);
  },

  componentDidUpdate(prevProps) {
    let prevChapterNumber = prevProps.params.chapter;
    let nextChapterNumber = this.props.params.chapter;

    if (prevChapterNumber !== nextChapterNumber) {
      this.loadManga();
    }
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
          <div className='reader-notice open-animation'>
            {message}
          </div>
        </div>
      );
    }

    let {params, location} = this.props;
    let nextChapterUrl = url.resolve(location.pathname, `${parseInt(params.chapter) + 1}${location.search}`);
    let prevChapterLink = <Link className='btn' to={nextChapterUrl}><i className='zmdi zmdi-fast-rewind'></i> Prev chapter</Link>;
    let nextChapterLink = <Link className='btn' to={nextChapterUrl}>Next chapter <i className='zmdi zmdi-fast-forward'></i></Link>;

    return (
      <div className='reader'>
        <header className='reader-header'>
          <h1>{manga.title} - Chapter {params.chapter}</h1>
        </header>

        <section className='reader-manga-pages'>
          {
            manga.pages.map((pageUrl, i) => {
              return (
                <div className='reader-manga-page' key={i}>
                  <img src={pageUrl} />
                </div>
              );
            })
          }
        </section>

        <nav className='reader-nav'>
          {params.chapter > 1 && prevChapterLink}
          {nextChapterLink}
        </nav>
      </div>
    );
  }
});

module.exports = ReaderPage;
