import localforage from 'localforage'
import SettingsAPI from './SettingsAPI'
import { STORAGE_KEY } from '../constants/ReadingListConstants'
import ReadingListActionsCreators from '../actions/ReadingListActionsCreators'

function loadFromChromeSync(callback) {
  chrome.storage.sync.get(STORAGE_KEY, data => {
    if (!data || !data.hasOwnProperty(STORAGE_KEY)) {
      callback([])
      return
    }

    callback(data[STORAGE_KEY])
  })
}

function loadFromLocalforage(callback) {
  localforage
    .getItem(STORAGE_KEY)
    .then((data) => {
      callback(data ? data : [])
    })
    .catch(() => {
      callback([])
    })
}

function loadFromStorage(callback) {
  SettingsAPI.getSettings(settings => {
    if (settings.syncData) {
      loadFromChromeSync(callback)
    }
    else {
      loadFromLocalforage(callback)
    }
  })
}

function addToChromeSync(manga, callback) {
  loadFromChromeSync((mangas) => {
    let newData = {}
    newData[STORAGE_KEY] = [...mangas, manga]
    chrome.storage.sync.set(newData, callback)
  })
}

function addToLocalforage(manga, callback) {
  loadFromLocalforage((mangas) => {
    let newData = {}
    newData[STORAGE_KEY] = [...mangas, manga]
    localforage
      .setItem(STORAGE_KEY, newData)
      .then(callback)
      .catch(callback)
  })
}

function addToStorage(manga, callback) {
  SettingsAPI.getSettings(settings => {
    if (settings.syncData) {
      addToChromeSync(manga, callback)
    }
    else {
      addToLocalforage(manga, callback)
    }
  })
}

// API methods

export function loadReadingList() {
  loadFromStorage(readingList =>
    ReadingListActionsCreators.loadReadingList(readingList))
}

export function getManga(mangaName, callback) {
  loadFromStorage(readingList => {
    let manga = readingList.filter(manga => mangaName === manga.normalizedName)

    if (!manga.length) {
      callback(null)
      return
    }

    callback(manga[0])
  })
}

export function addToReadingList(manga) {
  addToStorage(manga, () => {
    console.log(arguments)
  })
}

// TODO: remove bundled export
const ReadingListAPI = {
  loadReadingList,
  getManga,
  addToReadingList
}

export default ReadingListAPI
