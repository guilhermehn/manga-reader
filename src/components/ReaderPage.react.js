import React from 'react';
import ReaderAPI from '../apis/ReaderAPI';
import SettingsAPI from '../apis/SettingsAPI';
import ReaderStore from '../stores/ReaderStore';
import SettingsStore from '../stores/SettingsStore';
import LoadingIcon from './LoadingIcon.react';
import ProgressBar from './ProgressBar.react';
import {Link} from 'react-router';
import url from 'url';

const Page = React.createClass({
  handleLoad() {
    this.props.onLoad(null);
  },

  handleError(e) {
    this.props.onLoad(e);
  },

  render() {
    return (
      <img src={this.props.src} onLoad={this.handleLoad} onError={this.handleError} />
    );
  }
});

function getStateFromStores() {
  return {
    settings: SettingsStore.getSettings(),
    manga: ReaderStore.getManga(),
    doneLoadingManga: ReaderStore.doneLoadingManga(),
    loadedPagesCount: ReaderStore.getLoadedPagesCount()
  };
}

const ReaderPage = React.createClass({
  propTypes: {
    params: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired
  },

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
      ReaderAPI.resetLoadedPagesCount();
      this.loadManga();
    }
  },

  tickProgressBar() {
    ReaderAPI.pageDidLoad();
  },

  _onChange() {
    this.setState(getStateFromStores(this.props.params.name));
  },

  render() {
    let {manga, doneLoadingManga, loadedPagesCount} = this.state;

    if (!doneLoadingManga || !manga || !manga.hasOwnProperty('pages')) {
      let message;

      if (!doneLoadingManga) {
        message = 'Loading manga';
      }

      return (
        <div className='reader'>
          <div className='reader-notice open-animation'>
            <LoadingIcon text={message} />
          </div>
        </div>
      );
    }

    let {params, location} = this.props;
    let chapterNumber = parseInt(params.chapter);
    let prevChapterUrl = url.resolve(location.pathname, `${parseInt(chapterNumber) - 1}${location.search}`);
    let nextChapterUrl = url.resolve(location.pathname, `${parseInt(chapterNumber) + 1}${location.search}`);
    let prevChapterLink = <Link className='btn' to={prevChapterUrl}><i className='zmdi zmdi-fast-rewind'></i> Prev chapter</Link>;
    let nextChapterLink = <Link className='btn' to={nextChapterUrl}>Next chapter <i className='zmdi zmdi-fast-forward'></i></Link>;

    return (
      <div className='reader'>
        <ProgressBar total={manga.pages.length} progress={loadedPagesCount} hideOnComplete={true} />
        <header className='reader-header'>
          <h1>{manga.title} - Chapter {params.chapter}</h1>
        </header>

        <section className='reader-manga-pages'>
          {
            manga.pages.map((pageUrl, i) => {
              return (
                <div className='reader-manga-page' key={i}>
                  <Page src={pageUrl} onLoad={this.tickProgressBar} onError={this.tickProgressBar} />
                </div>
              );
            })
          }
        </section>

        <nav className='reader-nav'>
          {params.chapter > 1 && prevChapterLink}
          <strong>End of chapter {chapterNumber}</strong>
          {nextChapterLink}
        </nav>
      </div>
    );
  }
});

export default ReaderPage;
