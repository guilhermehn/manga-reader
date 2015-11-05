let React = require('react');
let MangaDetailsPanel = require('./MangaDetailsPanel.react');
// let SearchResultsSourceList = require('./SearchResultsSourceList.react');

let SearchResultsRow = React.createClass({
  getDefaultProps() {
    return {
      infoExpanded: false,
      handleClick() {}
    };
  },

  render() {
    let {manga, infoExpanded, handleClick} = this.props;

    return (
      <tr onClick={handleClick}>
        <td>
          {infoExpanded ? <h3 className='info-panel-title'>{manga.title}</h3> : manga.title}
          {infoExpanded && <MangaDetailsPanel manga={manga} />}
        </td>
        {/*<td className='search-results-site-list'>
          <SearchResultsSourceList title={manga.title} sources={manga.sources} />
        </td>*/}
      </tr>
    );
  }
});

module.exports = SearchResultsRow;
