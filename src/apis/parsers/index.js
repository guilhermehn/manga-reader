let async = require('async');

let parsers = {
  MangaFox: require('./MangaFox'),
  GoodManga: require('./GoodManga')
};

let parserList = Object.keys(parsers);

function normalizeName(name) {
  return name.toLowerCase().replace(/[\W]/g, '');
}

function mergeSearchResults(resultCollection) {
  let siteByNormalizedMangaName = {};

  resultCollection.forEach(parserResult => {
    parserResult.results.forEach((mangaData) => {
      let name = normalizeName(mangaData.title);
      mangaData.site = parserResult.parserName;

      if (siteByNormalizedMangaName.hasOwnProperty(name)) {
        siteByNormalizedMangaName[name].push(mangaData);
      }
      else {
        siteByNormalizedMangaName[name]= [mangaData];
      }
    });
  });

  let mangasNames = Object.keys(siteByNormalizedMangaName);

  return mangasNames
    .map(name => {
      let results = siteByNormalizedMangaName[name];

      return {
        title: results[0].title,
        sites: results
      };
    });
}

function search(term, done) {
  let tasks = parserList.map((parserName) => {
    let parser = parsers[parserName];

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
  let parserName = parserList.filter(parserName => {
    return parsers[parserName].name === name;
  });

  return parsers[parserName].icon;
}

module.exports = parsers;
module.exports.search = search;
module.exports.getParserIcon = getParserIcon;
