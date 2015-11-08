let React = require('react');
let ProgressBar = require('./ProgressBar.react');
let ReadingListAPI = require('../apis/ReadingListAPI');
let parsers = require('../apis/parsers');
let ReadingListStore = require('../stores/ReadingListStore');
let {Link} = require('react-router');
let moment = require('moment');

let EmptyReadingList = React.createClass({
  render() {
    return (
      <div className='reading-list-empty'>
        <h2>Your reading list is empty :(</h2>
        <p>Start by <Link to='/search'>searching for some mangas!</Link></p>
      </div>
    );
  }
});

let ReadingListItem = React.createClass({
  render() {
    let {item} = this.props;
    let done = item.lastReadChapter === item.lastChapter.number;
    let lastChapterDate = new Date(item.lastChapter.date);
    let newChapterSinceLastRead = lastChapterDate > new Date(item.lastReadDate);
    let newChapterLabel = null;

    if (newChapterSinceLastRead) {
      let lastChapterReleaseDate = moment(lastChapterDate);
      let newChapterLabelTitle = `Chapter ${item.lastChapter.number} was released at ${lastChapterReleaseDate.format('MMM, DD YYYY')}`;

      newChapterLabel = (
        <span className='reading-list-item-alert' title={newChapterLabelTitle}>New Chapter!</span>
      );
    }

    let nextChapterNumber = item.lastReadChapter + 1;
    let nextChapterUrl = `/reader/${item.normalizedName}/${item.source.name}/${nextChapterNumber}`;

    return (
      <div className='reading-list-item'>
        <h3>{item.title} {newChapterSinceLastRead && newChapterLabel}</h3>

        <div className='reading-list-item-source'>
          <img src={parsers.getParserIcon(item.source.name)} />
        </div>

        <div className='reading-list-item-progress'>
          <ProgressBar total={item.lastChapter.number} progress={item.lastReadChapter} />
        </div>

        <div className='reading-list-item-toolbar'>
          <div className='reading-list-item-toolbar-left'>
            {!done && <Link className='btn btn-primary' to={nextChapterUrl}>Read chapter <strong>{nextChapterNumber}</strong></Link>}
            {(done && item.status === 'complete') && <strong>Complete</strong>}
          </div>

          <div className='reading-list-item-toolbar-right'>
            {!done && <button type='button' className='btn-primary' title='Mark as complete'><i className='zmdi zmdi-check-all'></i></button>}
            <button type='button' className='btn-danger' title='Delete'><i className='zmdi zmdi-close'></i></button>
          </div>
        </div>
      </div>
    );
  }
});

let ReadingList = React.createClass({
  render() {
    return (
      <div className='reading-list-items'>
        {
          this.props.items.map((item, i) => <ReadingListItem item={item} key={i} />)
        }
      </div>
    );
  }
});

function getStateFromStores() {
  return {
    items: ReadingListStore.getReadingList()
  };
}

let ReadingListPage = React.createClass({
  getInitialState() {
    return getStateFromStores();
  },

  componentDidMount() {
    ReadingListStore.addChangeListener(this._onChange);
    ReadingListAPI.loadReadingList();
  },

  componentWillUnmount() {
    ReadingListStore.removeChangeListener(this._onChange);
  },

  _onChange() {
    this.setState(getStateFromStores());
  },

  render() {
    let content;

    if (this.state.items.length) {
      content = <ReadingList items={this.state.items} />;
    }
    else {
      content = <EmptyReadingList />;
    }

    return (
      <div className='reading-list-page'>
        <div className='reading-list-page-content'>
          {content}
        </div>
      </div>
    );
  }
});

module.exports = ReadingListPage;
