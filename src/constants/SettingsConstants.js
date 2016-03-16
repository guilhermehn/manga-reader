import keyMirror from 'keymirror'

const SETTINGS_SECTIONS = [
  {
    title: 'Sync',
    fields: [{
      type: 'checkbox',
      id: 'syncData',
      label: 'Use Chrome Sync to synchronize my reading data'
    }]
  },
  {
    title: 'Display mode',
    fields: [{
      type: 'checkbox',
      id: 'showWholeChapter',
      label: 'Show the whole chapter in one page'
    }]
  },
  {
    title: 'Chapter reading',
    fields: [{
      type: 'radio',
      id: 'chapterDisplayMode',
      options: [
        {
          label: 'One page',
          value: 'onePage'
        },
        {
          label: 'Double page',
          value: 'doublePage'
        }
      ]
    }]
  },
  {
    title: 'Chapter loading',
    fields: [
      {
        id: 'showTitleProgress',
        label: 'Show the loading progress on the tab title',
        type: 'checkbox'
      },
      {
        id: 'pageLoadOrder',
        label: 'Load pages in order',
        type: 'checkbox'
      },
      {
        id: 'loadNextChapter',
        label: 'Load the next chapter right after the actual chapter loading is done',
        type: 'checkbox'
      },
      {
        id: 'markAsReadOnLoad',
        label: 'Mark the chapter as read when it`s done loading',
        type: 'checkbox'
      }
    ]
  },
  {
    title: 'Miscellaneous',
    fields: [
      {
        id: 'showAds',
        type: 'checkbox',
        label: 'Show ads'
      },
      {
        id: 'showNavigationBar',
        type: 'checkbox',
        label: 'Show navigation bar'
      },
      {
        id: 'autoAddMangaToList',
        type: 'checkbox',
        label: 'Add manga to the reading list when I first read a chapter'
      },
      {
        id: 'useArrowsToNavigate',
        type: 'checkbox',
        label: 'Use the left and right arrow keys to navigate between the pages'
      },
      {
        id: 'bookmarkOnDoubleClick',
        type: 'checkbox',
        label: 'Add page to bookmarks on double click'
      },
      {
        id: 'nextChapterAfterLastPage',
        type: 'checkbox',
        label: 'Open next chapter when pressing right arrow on the last page'
      },
      {
        id: 'feedbackLink',
        type: 'checkbox',
        label: 'Show link to send feedback'
      },
      {
        id: 'showDevOptions',
        type: 'checkbox',
        label: 'Show developer options'
      }
    ]
  }
]

const DEFAULT_SETTINGS = {
  syncData: false,
  showWholeChapter: true,
  chapterDisplayMode: 'onePage',
  showTitleProgress: false,
  pageLoadOrder: false,
  loadNextChapter: true,
  markAsReadOnLoad: false,
  showAds: true,
  showNavigationBar: true,
  autoAddMangaToList: false,
  useArrowsToNavigate: true,
  bookmarkOnDoubleClick: true,
  nextChapterAfterLastPage: true,
  feedbackLink: true,
  showDevOptions: false,
  dismissMigration: false
}

const SETTINGS_KEY = 'Settings'

const ACTION_TYPES = keyMirror({
  RECEIVE_SETTINGS: null
})

export { SETTINGS_KEY, SETTINGS_SECTIONS, DEFAULT_SETTINGS, ACTION_TYPES }
