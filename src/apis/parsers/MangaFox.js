/* global $ */
// var $ = require('jquery');
'use strict';

var MIRROR_NAME = 'Manga Fox';

function getPage(url, done) {
  $.ajax({
    url : url,
    beforeSend(xhr) {
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('Pragma', 'no-cache');
    },
    success(response) {
      let page = document.createElement('div');
      page.innerHTML = response;
      done($(page), response);
    }
  });
}

var MangaFox = {
  url: 'http://mangafox.me/',
  mirrorName: MIRROR_NAME,
  languages: 'en',

  search(search, callback) {
    let urlManga = this.url + 'search.php?name=' + search + '&advopts=1';

    getPage(urlManga, function(page, body) {
      if (body.indexOf('No Manga Series') !== -1) {
        callback([]);
      }
      else {
        var result = page.find('#listing tr td:first-child a').map(function (i, el) {
          let $el = $(el);

          return {
            title: $el.html(),
            url: $el.attr('href')
          };
        }).get();

        callback(result);
      }
    });
  },

  getListOfChapters(manga, callback) {
    let url = manga.url + '?no_warning=1';

    getPage(url, function(page) {
      var res = page.find('ul.chlist h3, ul.chlist h4').map(function(i, el) {
        let $el = $(el);
        let chapterLink = $el.find('a');
        let chapterUrl = chapterLink.attr('href');

        if (chapterUrl.indexOf('/manga/') !== -1) {
          var number = chapterLink.text().substr(manga.title.length + 1);
          var volume = $el.parents('ul.chlist').prev('div.slide').children('h3').contents(':not(span)').text().trim().substr(7).trim();
          var title = $el.find('span.title').text().trim();
          var url = chapterUrl.substr(0, chapterUrl.lastIndexOf('/') + 1);

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

      callback(res);
    });
  },

  getChapterPages(chapter, done) {
    getPage(chapter.url + '1.html', function(page) {
      let firstPageUrl = page.find('#viewer > a img').attr('src');
      let pagesList = page
        .find('select.m')
        .first()
        .find('option')
        .map(function(i, el) {
          return parseInt(el.value);
        })
        .get()
        .filter(function(pageNumber) {
          return pageNumber > 0;
        })
        .map(function(pageNumber) {
          let n = pageNumber.toString();
          return firstPageUrl.replace(/(\d+)(\.jpg)$/, '0'.repeat(3 - n.length) + n + '.jpg');
        });

      done(pagesList);
    });
  }
};

MangaFox.search('Berserk', function(result) {
  let berserk = result[0];

  MangaFox.getListOfChapters(berserk, function(chapters) {
    let firstChapter = chapters[chapters.length - 1];

    MangaFox.getChapterPages(firstChapter, function(pages) {
      console.log(pages);
    });
  });
});
