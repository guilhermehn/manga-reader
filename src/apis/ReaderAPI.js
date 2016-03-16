import ReaderActionsCreators from '../actions/ReaderActionsCreators'
import SearchStore from '../stores/SearchStore'
import ReadingListAPI from '../apis/ReadingListAPI'
import ParsersAPI from '../apis/ParsersAPI'

function loadMangaByName(name, method, done) {
  switch (method) {
  case 'search': {
    done(SearchStore.getMangaByName(name))
    break
  }

  default: {
    ReadingListAPI.getManga(name, storedManga => done(storedManga))
  }
  }
}

function loadChapterPages(source, chapterNumber, done) {
  ParsersAPI.getChapterPages(source, chapterNumber, pages => done(pages))
}

function loadMangaChapter(name, sourceName, chapterNumber, method) {
  ReaderActionsCreators.startedLoadingManga()

  loadMangaByName(name, method, manga => {
    if (manga) {
      let source

      if (manga.sources) {
        source = manga.sources.filter(source => source.name === sourceName)[0]
      }
      else {
        source = manga.source
      }

      loadChapterPages(source, chapterNumber, pages => {
        manga.pages = pages
        ReaderActionsCreators.receiveMangaWithPages(manga)
      })
    }
  })
}

function pageDidLoad() {
  ReaderActionsCreators.pageDidLoad()
}

function resetLoadedPagesCount() {
  ReaderActionsCreators.resetLoadedPagesCount()
}

const ReaderAPI = {
  loadMangaChapter: loadMangaChapter,
  pageDidLoad: pageDidLoad,
  resetLoadedPagesCount: resetLoadedPagesCount
}

export default ReaderAPI
