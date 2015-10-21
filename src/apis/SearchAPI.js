let SearchActionsCreators = require('../actions/SearchActionsCreators');
let {
  MangaFox
} = require('./parsers');

function mergeSearchResults(parser, results) {
  return results.map(result => {
    let sites = {};
    sites[parser.name] = {
      url: result.url,
      icon: parser.icon
    };

    return {
      title: result.title,
      sites: sites
    };
  });
}

let SearchAPI = {
  search(term) {
    SearchActionsCreators.didSentSearch(term);

    MangaFox.search(term, (results) => {
      SearchActionsCreators.receiveSearchResults(mergeSearchResults(MangaFox, results));
    });
  }
};

module.exports = SearchAPI;
