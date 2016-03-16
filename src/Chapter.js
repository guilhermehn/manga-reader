class Chapter {
  constructor(obj) {
    let keys = ['number', 'volume', 'title', 'url', 'date']

    keys.forEach(key => {
      if (obj.hasOwnProperty(key)) {
        this[key] = obj[key]
      }
    })
  }
}

export default Chapter
