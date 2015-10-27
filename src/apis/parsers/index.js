let async = require('async');

let parsers = [
  require('./MangaFox'),
  require('./GoodManga')
];

let parsersByName = parsers.reduce((result, parser) => {
  result[parser.name] = parser;
  return result;
}, {});

function normalizeName(name) {
  return name.toLowerCase().replace(/[\W]/g, '');
}

function mergeSearchResults(resultCollection) {
  let siteByNormalizedMangaName = {};

  resultCollection.forEach(parserResult => {
    parserResult.results.forEach((source) => {
      let name = normalizeName(source.title);
      source.name = parserResult.parserName;

      if (siteByNormalizedMangaName.hasOwnProperty(name)) {
        siteByNormalizedMangaName[name].push(source);
      }
      else {
        siteByNormalizedMangaName[name] = [source];
      }
    });
  });

  let mangasNames = Object.keys(siteByNormalizedMangaName);

  return mangasNames
    .map(name => {
      let results = siteByNormalizedMangaName[name];

      return {
        title: results[0].title,
        sources: results
      };
    });
}

function search(term, done) {
  let tasks = parsers.map((parser) => {
    function parseTask(done) {
      parser.search(term, (results) => {
        done(null, {
          parserName: parser.name,
          results: results
        });
      });
    }

    return parseTask;
  });

  async.parallel(tasks, (err, resultCollection) => {
    done(mergeSearchResults(resultCollection));
  });
}

function getParserIcon(name) {
  return parsersByName[name].icon;
}

function getListOfChapters(manga, done) {
  manga.sources.forEach(source => {
    parsersByName[source.name].getListOfChapters(source, done);
  });
}

module.exports = parsers;
module.exports.byName = parsersByName;
module.exports.search = search;
module.exports.getParserIcon = getParserIcon;
module.exports.getListOfChapters = getListOfChapters;
