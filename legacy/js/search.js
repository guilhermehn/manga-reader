/*globals wssql, loadMenu, loadSearch, search, unescape*/

var mirrors;

function getQueryVariable (variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  var i;
  var pair;

  for (i = 0; i < vars.length; i += 0) {
    pair = vars[i].split('=');

    if (pair[0] === variable) {
      return pair[1];
    }
  }

  return false;
}

function load () {
  var searchInput;

  wssql.init();

  loadMenu('search');

  $('.article:not(#resTr)').show();

  mirrors = chrome.extension.getBackgroundPage().actMirrors;

  loadSearch();

  if (window.location.href.indexOf('?') !== -1) {
    searchInput = getQueryVariable('s');
    document.getElementById('searchBoxInput').value = unescape(searchInput).trim();

    search();
  }
}

$(function () {
  // Search when user press enter in the search box
  $('#searchBoxInput').on('keypress', function (e) {
    var key = e.keyCode || e.which;

    if (key === 13) {
      search();
    }
  });

  // Bind search to the search button
  $('#butFind').on('click', search);

  $(window).load(load);
});
