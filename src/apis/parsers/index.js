let parsers = [
  require('./MangaFox'),
  require('./GoodManga')
];

let parsersByName = parsers.reduce((result, parser) => {
  result[parser.name] = parser;
  return result;
}, {});

function getParserIcon(name) {
  return parsersByName[name].icon;
}

module.exports = parsers;
module.exports.byName = parsersByName;
module.exports.getParserIcon = getParserIcon;
