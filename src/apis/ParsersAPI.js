let async = require('async');
let parserUtils = require('./parsers/parserUtils');
let parsers = require('./parsers');

function mergeSearchResults(resultCollection) {
  let siteByNormalizedMangaName = {};

  resultCollection.forEach(parserResult => {
    parserResult.results.forEach((source) => {
      let name = parserUtils.normalizeName(source.title);
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
        normalizedName: name,
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

function getChapterPages(source, chapterNumber, done) {
  parsers.byName[source.name].getChapterPages(source.url, chapterNumber, done);
}

let ParsersAPI = {
  search: search,
  getChapterPages: getChapterPages
};

module.exports = ParsersAPI;
