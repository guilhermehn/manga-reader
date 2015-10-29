let $ = require('cheerio');
let {getPage} = require('./parserUtils');
let Chapter = require('../../Chapter');
let moment = require('moment');

let MangaFox = {
  url: 'http://mangafox.me/',
  name: 'Manga Fox',
  icon: 'http://mangafox.me/favicon.ico',
  languages: 'en',

  search(search, done, accumulator, nextUrl) {
    let urlManga = nextUrl ? nextUrl : `${this.url}search.php?name=${search}&advopts=1`;

    getPage(urlManga, (page, body) => {
      if (body.indexOf('No Manga Series') !== -1) {
        done([]);
        return;
      }

      let result = page.find('#listing tr td:first-child a').map((i, el) => {
        let $el = $(el);

        return {
          title: $el.html(),
          url: $el.attr('href')
        };
      }).get();

      let partialResult = Array.isArray(accumulator) ? accumulator.concat(result) : result;
      let nextPageLink = page.find('#nav li:last-child a');

      if (nextPageLink.length) {
        // MangaFox has a limited searchs
        setTimeout(() => {
          this.search(search, done, partialResult, `${this.url}${nextPageLink.attr('href').substring(1)}`);
        }, 6000);
      }
      else {
        done(partialResult);
      }
    });
  },

  getListOfChapters(manga, done) {
    let url = manga.url + '?no_warning=1';

    getPage(url, (page) => {
      let res = page.find('ul.chlist h3, ul.chlist h4').map((i, el) => {
        let $el = $(el);
        let chapterLink = $el.find('a');
        let chapterUrl = chapterLink.attr('href');

        if (chapterUrl.indexOf('/manga/') !== -1) {
          let number = chapterLink.text().substr(manga.title.length + 1);
          let volume = $el.parents('ul.chlist').prev('div.slide').children('h3').contents(':not(span)').text().trim().substr(7).trim();
          let title = $el.find('span.title').text().trim();
          let url = chapterUrl.substr(0, chapterUrl.lastIndexOf('/') + 1);

          if (url.substr(url.length - 2, 2) === '//') {
            url = url.substr(0, url.length - 1);
          }

          return {
            number: parseInt(number),
            volume: volume.length && parseInt(volume) || null,
            title: title.length || null,
            url: url
          };
        }
      }).get();

      done(res);
    });
  },

  getChapterPages(chapter, done) {
    getPage(chapter.url + '1.html', (page) => {
      let firstPageUrl = page.find('#viewer > a img').attr('src');
      let pagesList = page
        .find('select.m')
        .first()
        .find('option')
        .map((i, el) => {
          return parseInt(el.value);
        })
        .get()
        .filter((pageNumber) => {
          return pageNumber > 0;
        })
        .map((pageNumber) => {
          let n = pageNumber.toString();
          return firstPageUrl.replace(/(\d+)(\.jpg)$/, '0'.repeat(3 - n.length) + n + '.jpg');
        });

      done(pagesList);
    });
  },

  getMangaInfo(manga, done) {
    getPage(manga.url, (page) => {
      let infoCells = page.find('#title > table tr:nth-child(2) > td');
      let lastVolume = page.find('.volume').contents(':not(span)').text().trim();
      let chapterList = page.find('.chlist').eq(0);
      let lastChapterEl = chapterList.find('li:first-child');
      let lastChapterLinkEl = lastChapterEl.find('h3 a');
      let lastChapterTitleEl = lastChapterLinkEl.next('.title');
      let lastChapterDateString = lastChapterEl.find('.date').text().trim();
      let lastChapterDate;

      switch (lastChapterDateString) {
      case 'Today':
        lastChapterDate = moment(new Date());
        break;

      case 'Yesterday':
        lastChapterDate = moment(new Date()).subtract(1, 'days');
        break;

      default:
        lastChapterDate = moment(lastChapterDateString, 'MMM DD, YYYY');
      }

      done({
        releaseDate: infoCells.eq(0).find('a').text().trim(),
        authors: infoCells.eq(1).text().split(/,/).filter(name => !/\[\w+\]/.test(name)),
        artists: infoCells.eq(2).text().split(/,/),
        genres: infoCells.eq(3).text().toLowerCase().split(/,/),
        status: page.find('#series_info > div:nth-child(5) > span').text().split(/,/)[0].trim(),
        lastChapter: new Chapter({
          number: parseInt(/\d+$/.exec(lastChapterLinkEl.text())),
          volume: /\s\d+$/.test(lastVolume) ? parseInt(lastVolume.split(/\s+/)[1]) : null,
          title: lastChapterTitleEl.length ? lastChapterTitleEl.text().trim() : null,
          url: lastChapterLinkEl.attr('href'),
          date: lastChapterDate.toString()
        })
      });
    });
  }
};

module.exports = MangaFox;
