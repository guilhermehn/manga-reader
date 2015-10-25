let React = require('react');
let parsers = require('../apis/parsers');

let SearchResultsSourceList = React.createClass({
  render() {
    let {title, sources} = this.props;

    let sourcesIcons = sources.map((source, i) => {
      let altText = `Read '${title}' from ${source.title}`;

      return (
        <a key={i} href={source.url} target='_blank' title={altText}>
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
