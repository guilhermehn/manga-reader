import MangaFox from './MangaFox'
import GoodManga from './GoodManga'

const parsers = [MangaFox, GoodManga]

const parsersByName = parsers.reduce((result, parser) => {
  result[parser.name] = parser
  return result
}, {})

function getParserIcon(name) {
  return parsersByName[name].icon
}

export { parsersByName as byName, getParserIcon }
export default parsers
