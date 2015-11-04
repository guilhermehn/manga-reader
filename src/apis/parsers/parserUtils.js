let request = require('superagent');
let cheerio = require('cheerio');

let parserUtils = {
  getPage(url, done) {
    request
      .get(url)
      .end((err, res) => {
        let page = cheerio(res.text);
        done(page, res.text);
      });
  },

  normalizeName(name) {
    return name.toLowerCase().replace(/[\W]/g, '');
  }
};

module.exports = parserUtils;
