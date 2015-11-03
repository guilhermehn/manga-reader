let React = require('react');
let SearchStore = require('../stores/SearchStore');
let SettingsAPI = require('../apis/SettingsAPI');
let MangaAPI = require('../apis/MangaAPI');
let SettingsStore = require('../stores/SettingsStore');
let {History} = require('react-router');

function getStateFromStores() {
  return {
    settings: SettingsAPI.getSettings()
  };
}

let ReaderPage = React.createClass({
  mixins: [History],

  getInitialState() {
    return getStateFromStores();
  },

  componentDidMount() {
    SettingsStore.addChangeListener(this._onChange);
    SettingsAPI.loadSettings();

    let manga = SearchStore.getSelectedMangaToRead(this.props.params.name);
    // MangaAPI
  },

  componentWillUnmount() {
    SettingsStore.removeChangeListener(this._onChange);
  },

  _onChange() {
    this.setState(getStateFromStores());
  },

  componentWillMount() {
    // TODO: Try to get tha manga from the reading list before redirect

    // let {params} = this.props;
    // let manga = SearchStore.getSelectedMangaToRead(params.name);

    // if (!manga) {
    //   this.history.pushState(null, '/search');
    // }
  },

  render() {
    return (
      <div className='reader'>

      </div>
    );
  }
});

module.exports = ReaderPage;
