/*globals getMangaMirror, loadMenu, wssql*/
var mirrors;
var allBookmarks;

function openTab (urlToOpen) {
  chrome.runtime.sendMessage({
    action : 'opentab',
    url : urlToOpen
  }, $.noop);
}

function compareTo (a, b) {
  if (a < b) {
    return -1;
  }

  if (a === b) {
    return 0;
  }

  return 1;
}

function trim (x) {
  return x.trim().replace(/^\s*|\s*$/g, '');
}

function isSame (a, b) {
  var at = trim(a).toUpperCase();
  var bt = trim(b).toUpperCase();

  return at === bt;
}

function switchOnglet (ong, tab) {
  $('.tab').removeClass('checked');
  $(ong).addClass('checked');

  $('.ongletCont').each(function () {
    var $this = $(this);

    $this[$this.attr('id') === tab ? 'show' : 'hide']();
  });

  localStorage.bookmarkTab = tab;
}

function isMirrorEnable (mirrorName) {
  try {
    var bookmarkMirrorsState = localStorage.getItem('bookmarkMirrorsState');

    if (bookmarkMirrorsState !== null) {
      var obj = JSON.parse(bookmarkMirrorsState);
      var i = -1;
      var length = obj.length;

      while (++i < length) {
        if (obj[i].mirror === mirrorName) {
          return obj[i].state;
        }
      }
    }

    return true;
  }
  catch (e) {
    console.error(e);
  }
}

function setMirrorState (mirrorName, state) {
  try {
    var bookmarkMirrorsState = localStorage.getItem('bookmarkMirrorsState');

    if (bookmarkMirrorsState !== null) {
      var obj = JSON.parse(bookmarkMirrorsState);
      var isFound = false;
      var i;

      for (i = 0; i < obj.length; i += 1) {
        if (obj[i].mirror === mirrorName) {
          obj[i] = {
            mirror : mirrorName,
            state : state
          };

          localStorage.setItem('bookmarkMirrorsState', JSON.stringify(obj));
          isFound = true;

          break;
        }
      }

      if (!isFound) {
        obj[obj.length] = {
          mirror : mirrorName,
          state : state
        };

        localStorage.setItem('bookmarkMirrorsState', JSON.stringify(obj));
      }
    }
    else {
      localStorage.setItem('bookmarkMirrorsState', JSON.stringify([
        {
          mirror : mirrorName,
          state : state
        }
      ]));
    }
  }
  catch (e) {
    console.error(e);
  }
}

function slideChange () {
  var value = $('#slider').slider('option', 'value');
  var metric = value + 'px';
  localStorage.bookmarkSlideValue = value;

  $('.scanDiv, .scanImg img, .scanChap').css('max-width', metric);

  $('.scanImg').css({
    width: metric,
    height: metric
  });

  $('.scanImg img').css('max-height', metric);
}

function removeUnknown (list) {
  var lstRes = [];

  if (list && list.length) {
    lstRes = list.filter(function (item) {
      return getMangaMirror(item.mirror) !== null;
    });
  }

  return lstRes;
}

function modifyBookmark (dataElement) {
  var $bookmarkData = $('#bookmarkData');
  var dataAccessor = $bookmarkData.data.bind($bookmarkData);
  var data = dataElement.data();
  var $bookmarkPop = $('#bookmarkPop');
  var textDesc;

  dataAccessor({
    mirror: data.mirror,
    url: data.url,
    chapUrl: data.chapUrl,
    type: data.type,
    name: data.name,
    chapName: data.chapName,
    scanUrl: data.scanUrl,
    scanName: data.scanName,
    note: data.note
  });

  $('#noteAMR').val(data.note);

  if (data.type === 'chapter') {
    textDesc = ['Bookmark chapter "', data.chapName, '" of "', data.name, '" on "', data.mirror].join(' ');
  }
  else {
    textDesc = ['Bookmark scan "', data.scanName, '" of chapter "', data.chapName, '" of "', data.name, '" on "', data.mirror].join(' ');
  }

  textDesc += '". You can add notes below which will be associated with this bookmark.';

  $bookmarkPop
    .modal({
      focus : false
    })
    .find('#descEltAMR')
    .text(textDesc);
}

function sortBookmarks (bms) {
  bms.sort(function (a, b) {
    if (isSame(a.name, b.name)) {
      if (a.chapterUrl === b.chapterUrl) {
        if (a.type === b.type) {
          if (a.type === 'chapter') {
            return 0;
          }

          return compareTo(a.scanName, b.scanName);
        }

        if (a.type === 'chapter') {
          return -1;
        }

        return 1;
      }

      return compareTo(a.chapterUrl, b.chapterUrl);
    }

    return compareTo(a.name, b.name);
  });
}

function filter () {
  var results;
  var found = false;

  var $selected = $('#mangas option:selected');
  var selectedValue = $selected.val().trim();
  var searchTerm = $('#searchBoxInput').val().trim();

  results = allBookmarks.filter(function (bookmark) {
    var isOk = true;

    if (selectedValue.length === 0 && !isSame(selectedValue, bookmark.name)) {
      isOk = false;
    }

    if (searchTerm.length !== 0) {
      if (bookmark.name.indexOf(searchTerm) !== -1) {
        found = true;
      }

      if (bookmark.chapName.indexOf(searchTerm) !== -1) {
        found = true;
      }

      if (bookmark.note.indexOf(searchTerm) !== -1) {
        found = true;
      }

      if (!found) {
        isOk = false;
      }
    }

    if (!$('#mirrorsCheck img[title=\'' + bookmark.mirror + '\']').parent().parent().hasClass('checked')) {
      isOk = false;
    }

    return isOk;
  });

  if (results.length > 0) {
    $('#results').show();
    $('#nores').hide();
    renderManga(results);
    slideChange();
  }
  else {
    $('#results').hide();
    $('#nores').show();
  }
}

function addOptionValue (currentManga, valMg) {
  var opt = $('<option value=\'' + currentManga + '\'>' + currentManga + '</option>');

  if (valMg !== null && valMg !== '' && isSame(valMg, currentManga)) {
    opt.attr('selected', true);
  }

  $('#mangas').append(opt);
}

function loadBookmarks () {
  var bookmarkMangasSearch = localStorage.getItem('bookmarkMangasSearch');

  if (typeof bookmarkMangasSearch !== 'undefined') {
    $('#searchBoxInput').val(bookmarkMangasSearch);
  }

  var lstTmp = JSON.parse(localStorage.getItem('bookmarks'));
  var valMg = null;
  var currentManga;
  var i;

  allBookmarks = removeUnknown(lstTmp);

  var $mangas = $('#mangas').empty();

  if (allBookmarks.length > 0) {
    sortBookmarks(allBookmarks);

    if (typeof localStorage.bookmarkMangasSelect !== 'undefined') {
      valMg = localStorage.bookmarkMangasSelect;
    }

    $mangas
      .append('<option value=\'\' ' + ((valMg === '') ? 'selected=\'selected\'' : '') + '>All mangas</option>');

    for (i = 0; i < allBookmarks.length; i += 1) {
      if (typeof currentManga !== 'undefined' && !isSame(currentManga, allBookmarks[i].name)) {
        addOptionValue(currentManga, valMg);
      }

      currentManga = allBookmarks[i].name;
    }

    if (typeof currentManga !== 'undefined') {
      addOptionValue(currentManga, valMg);
    }

    filter();
  }
  else {
    $mangas
      .attr('disabled', 'true')
      .append('<option value=\'\'>No bookmarks found</option>');

    $('#results').hide();
    $('#nores').show();
  }
}

function deleteBM (dataElt) {
  var textDesc;
  var res;

  if (dataElt.data('type') === 'chapter') {
    textDesc = 'Are you sure to delete the bookmarked chapter \'' + $('#bookmarkData').data('chapName') + '\' of \'' + $('#bookmarkData').data('name') + '\' on \'' + $('#bookmarkData').data('mirror') + '\'?';
  }
  else {
    textDesc = 'Are you sure to delete the bookmarked scan \'' + $('#bookmarkData').data('scanName') + '\' of chapter \'' + $('#bookmarkData').data('chapName') + '\' of \'' + $('#bookmarkData').data('name') + '\' on \'' + $('#bookmarkData').data('mirror') + '\' ?';
  }

  res = confirm(textDesc);

  if (res) {
    var obj = {
      action : 'deleteBookmark',
      mirror : dataElt.data('mirror'),
      url : dataElt.data('url'),
      chapUrl : dataElt.data('chapUrl'),
      type : dataElt.data('type')
    };

    if (dataElt.data('type') !== 'chapter') {
      obj.scanUrl = dataElt.data('scanUrl');
      obj.scanName = dataElt.data('scanName');
    }

    chrome.runtime.sendMessage(obj, loadBookmarks);
  }
}

function createScan (obj, where) {
  var divImg = $('<div class=\'scanDiv\'></div>');
  var mirror = getMangaMirror(obj.mirror);

  divImg.data({
    mirror: obj.mirror,
    url: obj.url,
    chapUrl: obj.chapUrl,
    type: obj.type,
    name: obj.name,
    chapName: obj.chapName,
    scanUrl: obj.scanUrl,
    scanName: obj.scanName,
    note: obj.note
  });

  var divIconsCont = $('<div class=\'scanIconsCont\'></div>');
  var divIcons = $('<div class=\'scanIcons\'></div>');

  divIconsCont.append(divIcons);
  divImg.append(divIconsCont);

  var imgMirror = $('<div class=\'scanMirror\'><img src=\'' + mirror.mirrorIcon + '\' title=\'' + mirror.mirrorName + '\'/></div>');
  divIcons.append(imgMirror);

  var imgModify = $('<div class=\'scanMirror\'></div>');
  var aMod = $('<a href=\'#\'><img src=\'img/edit.png\' title=\'Modify\'/></a>');

  aMod.click(function () {
    modifyBookmark($(this).parent().parent().parent().parent());
    return false;
  });

  imgModify.append(aMod);
  divIcons.append(imgModify);

  var imgDelete = $('<div class=\'scanMirror\'></div>');
  var aDel = $('<a href=\'#\'><img src=\'img/cancel.png\' title=\'Delete Bookmark\'/></a>');

  aDel.click(function () {
    deleteBM($(this).parent().parent().parent().parent());
    return false;
  });

  imgDelete.append(aDel);
  divIcons.append(imgDelete);

  var divImgImg = $('<div class=\'scanImg\'></div>');
  var img = $('<a href=\'' + obj.scanUrl + '\' rel=\'prettyPhoto[gal]\' title=\'' + obj.note + '\'></a>');
  var imgimg = $('<img src=\'' + obj.scanUrl + '\' alt=\'' + obj.chapName + '\' />');

  imgimg.appendTo(img);
  imgimg.load(function () {
    if (this.width < this.height) {
      $('.scanMirror', $(this).parent().parent().parent()).addClass('horiz');
    }
  });

  img.appendTo(divImgImg);
  divImgImg.appendTo(divImg);

  var chap = $('<div class=\'scanChap\'>' + obj.chapName + '</span><' + (($('#mangas option:selected').val() === '') ? '&nbsp;(' + obj.name + ')' : '') + '</div>');

  // Create the a tag and append the function
  var linkObj = $('<a href=\'#\' >' + obj.chapName + '</a>');
  var aUrl = obj.chapUrl;

  linkObj.click(openTab.bind(null, aUrl));
  chap.append(linkObj);

  var note = $('<div class=\'scanNote\'><span>' + obj.note + '</span></div>');

  divImg.append(note);
  where.append(divImg);

  var scanIconsCont = divImg.find('.scanIconsCont');

  divImg.hover(
    scanIconsCont.fadeIn.bind(scanIconsCont, 200),
    scanIconsCont.fadeOut.bind(scanIconsCont, 200)
  );
}

function renderManga (lstBms) {
  var divChaps;
  var divScans;
  var parity = 0;
  var i;

  for (i = 0; i < lstBms.length; i += 1) {
    if (lstBms[i].type === 'chapter') {
      if (divChaps === undefined) {
        $('#noreschap').css('display', 'none');
        divChaps = $('<div class=\'mangaChapsDiv\'></div>');
        $('#resultschap').empty();
        divChaps.appendTo($('#resultschap'));
        $('<table></table>').appendTo(divChaps);
      }

      var tr = $('<tr class=\'chapLine\'></tr>');
      tr.data('mirror', lstBms[i].mirror);
      tr.data('url', lstBms[i].url);
      tr.data('chapUrl', lstBms[i].chapUrl);
      tr.data('type', lstBms[i].type);
      tr.data('name', lstBms[i].name);
      tr.data('chapName', lstBms[i].chapName);
      tr.data('note', lstBms[i].note);

      if (parity % 2 === 0) {
        tr.addClass('even');
      }
      else {
        tr.addClass('odd');
      }

      tr.appendTo($('table', divChaps));

      // Create the a tag and append the function
      var alink = $('<a href=\'#\' >' + lstBms[i].chapName + '</a>');
      var achapUrl = lstBms[i].chapUrl;

      alink.click(openTab.bind(null, achapUrl));

      var tdChap = $('<td class=\'chapName\'><img src=\'' + getMangaMirror(lstBms[i].mirror).mirrorIcon + '\' title=\'' + getMangaMirror(lstBms[i].mirror).mirrorName + '\'/>' + (($('#mangas option:selected').val() === '') ? '&nbsp;(' + lstBms[i].name + ')' : '') + '</td>');
      tdChap.appendTo(tr);
      alink.appendTo(tdChap);

      var tdNote = $('<td class=\'chapNote\'>' + lstBms[i].note + '</td>');
      tdNote.appendTo(tr);

      var divIconsCont = $('<div class=\'scanIconsContTd\'></div>');
      var divIcons = $('<div class=\'scanIcons\'></div>');
      divIcons.appendTo(divIconsCont);
      divIconsCont.appendTo(tdNote);

      var imgModify = $('<div class=\'scanMirror\'></div>');
      var aMod = $('<a href=\'#\'><img src=\'img/edit.png\' title=\'Modify\'/></a>');

      aMod.click(function () {
        modifyBookmark($(this).parent().parent().parent().parent().parent());
        return false;
      });

      aMod.appendTo(imgModify);
      imgModify.appendTo(divIcons);
      var imgDelete = $('<div class=\'scanMirror\'></div>');
      var aDel = $('<a href=\'#\'><img src=\'img/cancel.png\' title=\'Delete Bookmark\'/></a>');

      aDel.click(function () {
        deleteBM($(this).parent().parent().parent().parent().parent());
        return false;
      });

      aDel.appendTo(imgDelete);
      imgDelete.appendTo(divIcons);
      parity += 1;
    }
    else {
      if (divScans === undefined) {
        $('#noresscans').css('display', 'none');
        divScans = $('<div class=\'mangaScansDiv\'></div>');

        $('#resultsscans').empty();

        divScans.appendTo($('#resultsscans'));
      }

      createScan(lstBms[i], divScans);
    }
  }

  $('#resultschap .mangaChapsDiv .chapLine:first').addClass('firstLine');
  $('#resultschap .mangaChapsDiv .chapLine:last').addClass('lastLine');

  if (divChaps === undefined) {
    $('#resultschap').empty();
    $('#noreschap').css('display', 'block');
  }

  if (divScans === undefined) {
    $('#resultsscans').empty();
    $('#noresscans').css('display', 'block');
  }

  $('a[rel^=\'prettyPhoto\']').prettyPhoto({
    animation_speed : 'fast',
    theme : 'light_rounded',
    overlay_gallery : false,
    keyboard_shortcuts : true
  });
}

function createPopupBM () {
  var divData = $('<div id=\'bookmarkData\' style=\'display:none\'></div>');

  divData.append('<span>This div is used to store data for AMR</span>');
  $(document.body).append(divData);

  var div = $('<div id=\'bookmarkPop\' style=\'display:none\'></div>');

  $('<h3>Bookmark</h3>').appendTo(div);
  $('<div id=\'descEltAMR\'></div>').appendTo(div);
  $('<table><tr><td style=\'vertical-align:top\'><b>Note:</b></td><td><textarea id=\'noteAMR\' cols=\'50\' rows=\'5\' /></td></tr></table>').appendTo(div);

  var btn = $('<a id=\'saveBtnAMR\' class=\'buttonAMR\'>Save</a>');
  btn.click(function () {
    var obj = {
      action : 'addUpdateBookmark',
      mirror : $('#bookmarkData').data('mirror'),
      url : $('#bookmarkData').data('url'),
      chapUrl : $('#bookmarkData').data('chapUrl'),
      type : $('#bookmarkData').data('type'),
      name : $('#bookmarkData').data('name'),
      chapName : $('#bookmarkData').data('chapName')
    };
    if ($('#bookmarkData').data('type') !== 'chapter') {
      obj.scanUrl = $('#bookmarkData').data('scanUrl');
      obj.scanName = $('#bookmarkData').data('scanName');
    }
    obj.note = $('#noteAMR').val();
    chrome.runtime.sendMessage(obj, loadBookmarks);
    $.modal.close();
    return false;
  });
  btn.appendTo(div);
  div.appendTo($(document.body));
}

function imgClickHandler (e) {
  var $this = $(this);
  var $parent = $this.parent();

  $parent.toggleClass('checked');

  setMirrorState($this.find('img').attr('title'), $parent.hasClass('checked'));

  filter();
  e.preventDefault();
  e.stopPropagation();
}

function load () {
  loadMenu('bookmarks');

  $('.showInit').show();

  var bookmarkTab = localStorage.getItem('bookmarkTab');

  if (typeof bookmarkTab !== 'undefined') {
    switchOnglet($('#chapOng')[0], bookmarkTab === 'ongC' ? 'ongC' : 'ongS');
  }

  wssql.init();

  mirrors = chrome.extension.getBackgroundPage().actMirrors;

  mirrors.forEach(function (mirror) {
    var mirrorName = mirror.mirrorName;
    var imga = $('<a href=\'#\'><img src=\'' + mirror.mirrorIcon + '\' title=\'' + mirrorName + '\'/></a>');

    imga.click(imgClickHandler);

    var div = isMirrorEnable(mirrorName) ? '<div class=\'mirrorIcon checked\'></div>' : '<div class=\'mirrorIcon\'></div>';

    $(div).append(imga);
    $('#mirrorsCheck').append(div);
  });

  var valSlide = localStorage.bookmarkSlideValue;

  if (valSlide === undefined || valSlide === 0 || valSlide === '0') {
    valSlide = 298;
  }

  /*$('#slider').slider({
    min : 80,
    max : 750,
    value : valSlide,
    change : function (event, ui) {
      slideChange();
    }
  });*/

  $('#mangas').change(function () {
    localStorage.setItem('bookmarkMangasSelect', $(this).find('option:selected').val());
  });

  createPopupBM();
  loadBookmarks();
}

function updateBookmarkMangasSearch () {
  localStorage.setItem('bookmarkMangasSearch',  $('#searchBoxInput').val());
}

$(function () {
  $('#mangas').change(filter);

  $('#searchBoxInput').keypress(function (e) {
    var key = e.keyCode || e.which;

    if (key === 13) {
      updateBookmarkMangasSearch();
      filter();
    }
  });

  $('#butFind').click(function () {
    updateBookmarkMangasSearch();
    filter();
  });

  $('#chapOng').click(switchOnglet.bind(null, this, 'ongC'));

  $('#scanOng').click(switchOnglet.bind(null, this, 'ongS'));

  load();
});
