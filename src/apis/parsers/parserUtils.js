let request = require('superagent');
let cheerio = require('cheerio');

const SCRIPT_TAG_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/g;

function stripScriptTags(body) {
  return body.replace(SCRIPT_TAG_REGEX, '');
}

let parserUtils = {
  getPage(url, done) {
    request
      .get(url)
      .end((err, res) => {
        let page = cheerio(res.text);
        done(page, res.text);
      });
  }
};

module.exports = parserUtils;
