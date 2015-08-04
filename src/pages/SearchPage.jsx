var searchResultsHeaders = ['Title', 'Mirrors'].map((item) => {
  return <th key={`th-${item}`}>{item}</th>;
});

var RESULTS = [
  {
    title: 'Berserk',
    mirrors: ['GoodManga', 'OneManga', 'MangaFox']
  },
  {
    title: 'Bleach',
    mirrors: ['GoodManga', 'OneManga', 'MangaFox']
  },
  {
    title: 'Gantz',
    mirrors: ['GoodManga', 'OneManga', 'MangaFox']
  }
];

class SearchFieldComponent extends React.Component {
  performAction () {
    this.props.action(this.refs.searchTerm.getDOMNode().value);
  }

  searchKeyPress (e) {
    if (e.which === 13) {
      this.performAction();
    }
  }

  render () {
    return (
      <div className='search-field'>
        <input type='text' onKeyPress={this.searchKeyPress} className='search-input' ref='searchTerm' />
        <button className='search-btn' onClick={this.performAction}><i className='zmdi zmdi-lg zmdi-search'></i></button>
      </div>
    );
  }
}

class SearchResultsComponent extends React.Component {
  render () {
    let results = this.props.results;

    return (
      <table>
        <thead>
          {searchResultsHeaders}
        </thead>
        <tbody>
          {results.map((result, i) => {
            return (
              <tr key={`manga-result-${i}`}>
                <td>{result.title}</td>
                <td>{result.mirrors.join(', ')}</td>
              </tr>
            );
          })}
        </tbody>
        {results.length > 50 && (
          <tfoot>
            {searchResultsHeaders}
          </tfoot>
        )}
      </table>
    );
  }
}

class EmptyResultSearchComponent extends React.Component {
  render () {
    return (
      <strong>No manga contains the search term '{this.props.searchTerm}'</strong>
    );
  }
}

class SearchPage extends React.Component {
  state: {
    searchTerm: '',
    results: []
  }

  search (term) {
    if (term.length) {
      console.log(term);
    }
  }

  render () {
    return (
      <div>
        <h2>Search mangas</h2>

        <SearchFieldComponent action={this.search} />

        {() => {
          if (this.state.results.length) {
            return <SearchResultsComponent results={this.state.results} />;
          }
          else if (this.state.searchTerm !== '') {
            return <EmptyResultSearchComponent searchTerm={this.state.searchTerm} />;
          }
        }}
      </div>
    );
  }
}

MR.Router.register('search', () => {
  MR.renderPage(<SearchPage />);
});
