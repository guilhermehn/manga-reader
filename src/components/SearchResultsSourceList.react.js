let React = require('react');
let parsers = require('../apis/parsers');
let {stopPropagation} = require('../utils');

let SearchResultsSourceList = React.createClass({
  render() {
    let {title, sources} = this.props;

    let sourcesIcons = sources.map((source, i) => {
      let altText = `Read '${title}' from ${source.name}`;

      return (
        <a key={i} href={source.url} target='_blank' title={altText} onClick={stopPropagation}>
          <img src={parsers.byName[source.name].icon} alt={altText} />
        </a>
      );
    });

    return (
      <span className='ta-right'>{sourcesIcons}</span>
    );
  }
});

module.exports = SearchResultsSourceList;
