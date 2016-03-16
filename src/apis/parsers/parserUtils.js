import superagent from 'superagent'
import cheerio from 'cheerio'

function getPage(url, done) {
  superagent
    .get(url)
    .end((err, res) => {
      let page = cheerio(res.text)
      done(page, res.text)
    })
}

function normalizeName(name) {
  return name.toLowerCase().replace(/[\W]/g, '')
}

export { getPage, normalizeName }
