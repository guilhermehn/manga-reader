/*globals getMangaMirror, getElementsByClass, MgUtil, mirrors, wssql*/
var tempMirrorListAll;
var nbToLoad;
var ancNbToLoad;
var curSearch;
var isOver;

var IMAGE_PATH = chrome.extension.getURL('img/');

function sendExtRequestS (request, button, callback, backsrc) {
  if (button.data('currentlyClicked')) {
    return;
  }

  button.data('currentlyClicked', true);

  var ancSrc;
  if (button.is('img')) {
    ancSrc = button.attr('src');
    button.attr('src', chrome.extension.getURL('img/load16.gif'));
  }

  chrome.runtime.sendMessage(request, function () {
    callback();
    if (button.is('img') && backsrc) {
      button.attr('src', ancSrc);
    }

    button.removeData('currentlyClicked');
  });
}

function switchOnglet (ong, tab) {
  var ongsTitle = getElementsByClass('onglet', document);

  for (var i = 0; i < ongsTitle.length; i++) {
    ongsTitle[i].className = 'onglet';
  }

  ong.className += ' active';
  var ongsCont = getElementsByClass('ongletCont', document);

  for (i = 0; i < ongsCont.length; i++) {
    ongsCont[i].style.display = 'none';
  }

  document.getElementById(tab).style.display = 'table';
}

function isMirrorEnable (mirrorName) {
  var searchMirrorsStateJson = localStorage.getItem('searchMirrorsState');
  var mirrors;
  var i = -1;
  var length;

  if (searchMirrorsStateJson) {
    mirrors = JSON.parse(searchMirrorsStateJson);
    length = mirrors.length;

    while (++i < length) {
      if (mirrors[i].mirror === mirrorName) {
        return mirrors[i].state;
      }
    }
  }

  return true;
}

function setMirrorState (mirrorName, state) {
  var searchMirrorsStateJson = localStorage.getItem('searchMirrorsState');

  if (searchMirrorsStateJson) {
    var obj = JSON.parse(searchMirrorsStateJson);
    var isFound = false;
    var i = -1;
    var length = obj.length;

    while (++i < length) {
      if (obj[i].mirror === mirrorName) {
        obj[i] = {
          mirror : mirrorName,
          state : state
        };

        localStorage.setItem('searchMirrorsState', JSON.stringify(obj));
        isFound = true;
        break;
      }
    }

    if (!isFound) {
      obj[obj.length] = {
        mirror : mirrorName,
        state : state
      };

      localStorage.setItem('searchMirrorsState', JSON.stringify(obj));
    }
  }
  else {
    var searchMirrorJson = JSON.stringify([
      {
        mirror : mirrorName,
        state : state
      }
    ]);

    localStorage.setItem('searchMirrorsState', searchMirrorJson);
  }
}

function toggleMirrorsSelection (selected) {
  $('.mirror-icon').each(function () {
    var $this = $(this);

    $this[selected ? 'removeClass' : 'addClass']('mirror-icon-disabled');
    $('img', $this.closest('tr').next())[selected ? 'show' : 'hide']();
    setMirrorState($this.attr('title'), selected);
  });
}

function saveSelectedLanguage () {
  localStorage.setItem('searchLanguage', $('#selectors select option:selected').val());
}

function formatMgName (name) {
  if (!name) {
    return '';
  }

  return name.trim().replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}

function bindSearchGlobActs () {
  $('.mirrorsearchimg').click(function () {
    chrome.runtime.sendMessage({
      action : 'opentab',
      url : $(this).data('urlmirror')
    }, function (response) {});
  });

  $('.externsearch').click(function () {
    $('.mirrorsearchimg', $(this).closest('td').next()).each(function () {
      chrome.runtime.sendMessage({
        action : 'opentab',
        url : $(this).data('urlmirror')
      }, function (response) {});
    });
  });

  $('.addsinglemg').click(function () {
    var img = $('img.mirrorsearchimg', $(this).closest('.eltmirrorsearch'));
    var obj = {
      action : 'readManga',
      mirror : img.data('mirrorname'),
      url : img.data('urlmirror'),
      name : img.data('manganame')
    };

    sendExtRequestS(obj, $(this), function () {}, true);
  });

  $('.addsearch').click(function () {
    var obj = {
      action : 'readMangas',
      list : []
    };

    $('.mirrorsearchimg', $(this).closest('td').next()).each(function () {
      obj.list[obj.list.length] = {
        mirror : $(this).data('mirrorname'),
        url : $(this).data('urlmirror'),
        name : $(this).data('manganame')
      };
    });

    sendExtRequestS(obj, $(this), function () {}, true);
  });
}

function fillCurrentLstSingleMg (lstCur) {
  var nameCur = lstCur[lstCur.length - 1].name;
  var trCur = $('<tr></tr>');
  var tdHead = $('<td class=\'mangaName\'></td>');

  $('<span>' + nameCur + '</span><div class=\'optmgsearch\'><img class=\'externsearch\' src=\'img/external.png\' title=\'Open all occurences of this manga on their respective websites\'/><img class=\'addsearch\' src=\'img/add.png\' title=\'Add all occurences of this manga in your manga list\'/></div>').appendTo(tdHead);

  tdHead.appendTo(trCur);
  trCur.appendTo($('#allres'));

  var tdMgs = $('<td class=\'listMirror\'></td>');

  tdMgs.appendTo(trCur);

  for (var i = 0; i < lstCur.length; i++) {
    if (getMangaMirror(lstCur[i].mirror) !== null) {
      var urlCur = lstCur[i].url;
      var img = $('<img class=\'mirrorsearchimg\' src=\'' + getMangaMirror(lstCur[i].mirror).mirrorIcon + '\' title=\'' + nameCur + ' on ' + lstCur[i].mirror + '\' />');
      img.data('urlmirror', urlCur);
      img.data('mirrorname', lstCur[i].mirror);
      img.data('manganame', nameCur);
      var divelt = $('<div class=\'eltmirrorsearch\'><img class=\'addsinglemg\' src=\'img/addlt.png\' title=\'Add this manga in your list on ' + lstCur[i].mirror + '\'/></div>');
      divelt.prepend(img);
      divelt.appendTo(tdMgs);
    }
  }
}

function fillListOfSearchAll (lst) {
  $('#resTr').css('display', 'table-row');
  $('#results').empty();

  if (lst.length > 0) {
    $('#nores').hide();
    $('#results')
      .show()
      .append('<table cellpadding=\'0\' cellspacing=\'0\' id=\'allres\'></table>');

    var ancName = '';
    var lstCur = [];
    var resultLength = 0;

    for (var j = 0; j < lst.length; j++) {
      if (ancName !== '' && lstCur.length > 0 && formatMgName(lst[j].name) !== ancName) {
        fillCurrentLstSingleMg(lstCur);
        resultLength++;
        lstCur = [];
      }

      lstCur[lstCur.length] = lst[j];
      ancName = formatMgName(lst[j].name);
    }

    if (lstCur.length > 0) {
      fillCurrentLstSingleMg(lstCur);
    }

    bindSearchGlobActs();
    if (resultLength !== 0) {
      $('#result-count').show();

      if (lst.length >= 900 || isOver) {
        $('#result-count').html('<span>' + resultLength + ' manga found (' + lst.length + ' places to read them)</span><br /><span>There is too much results, only the first results are displayed. (All web sites have not been searched)</span>');
      }
      else {
        $('#result-count').text(resultLength + ' manga found (' + lst.length + ' places to read them)');
      }
    }
  }
  else {
    $('#nores').show();
    $('#results').hide();
    $('#result-count').hide();
  }
}

function loadSelectors () {
  var selectAllMirrorsButton = $('<img src=\'' + IMAGE_PATH + 'select_all.png' + '\' title=\'Select all\'/>');
  var selectNoMirrorsButton = $('<img src=\'' + IMAGE_PATH + 'select_none.png' + '\' title=\'Select none\'/>');
  var selectAlreadyUsedMirrorsButton = $('<img src=\'' + IMAGE_PATH + 'bookmark.png' + '\' title=\'Select all on which i have at least one manga in my list\'/>');

  var $selectors = $('#selectors');
  var $options = $selectors.find('select option');
  var $first = $options.filter(':first');

  // Select all mirrors
  selectAllMirrorsButton.click(function () {
    toggleMirrorsSelection(true);

    $first.attr('selected', true);
    saveSelectedLanguage();
  });

  // Deselect all mirrors
  selectNoMirrorsButton.click(function () {
    toggleMirrorsSelection(false);

    $first.attr('selected', true);
    saveSelectedLanguage();
  });

  // Select only mirrors already used
  selectAlreadyUsedMirrorsButton.click(function () {
    var unused = MgUtil.getUsedMirrors(mirrors, JSON.parse(localStorage.getItem('mangas')));

    $('.mirror-icon img').each(function () {
      var $this = $(this);
      var title = $this.attr('title');
      var isFound = unused.some(function (mirror) {
        return mirror === title;
      });

      $this[isFound ? 'removeClass' : 'addClass']('disabled');
      $('img', $this.closest('tr').next())[isFound ? 'show' : 'hide']();
      setMirrorState($this.attr('title'), !isFound);
    });

    $first.attr('selected', true);
    localStorage.setItem('searchLanguage', $options.filter(':selected').val());
  });

  selectAllMirrorsButton.appendTo($selectors);
  selectNoMirrorsButton.appendTo($selectors);
  selectAlreadyUsedMirrorsButton.appendTo($selectors);

  var sel = MgUtil.getLanguageSelect(mirrors);

  sel.change(function () {
    var lang = $('option:selected', $(this)).val();

    if (lang === 'all') {
      $('.mirror-icon img').each(function () {
        $(this).removeClass('disabled');
        $('img', $(this).closest('tr').next()).show();
        setMirrorState($(this).attr('title'), true);
      });
    }
    else {
      var langMirrors = MgUtil.getMirrorsFromLocale(mirrors, lang);
      $('.mirror-icon img').each(function () {
        var isFound = false;
        for (var i = 0; i < langMirrors.length; i++) {
          if (langMirrors[i] === $(this).attr('title')) {
            isFound = true;
            break;
          }
        }
        if (!isFound) {
          $(this).addClass('disabled');
          $('img', $(this).closest('tr').next()).hide();
          setMirrorState($(this).attr('title'), false);
        }
        else {
          $(this).removeClass('disabled');
          $('img', $(this).closest('tr').next()).show();
          setMirrorState($(this).attr('title'), true);
        }
      });
    }

    localStorage.setItem('searchLanguage', $('#selectors select option:selected').val());
  });

  var searchLanguage = localStorage.getItem('searchLanguage');

  if (searchLanguage) {
    sel.val(searchLanguage);
  }

  var spansel = $('<span class=\'custom-select\'></span>');
  sel.appendTo(spansel);
  spansel.appendTo($('#selectors'));
}

function loadSearch () {
  loadSelectors();

  mirrors.forEach(function (mirror) {
    var newItem = $('<div class=\'mirror-icon\'><img src=\'' + mirror.mirrorIcon + '\' title=\'' + mirror.mirrorName + '\'/><div class=\'mirror-status\'><img src=\'' + IMAGE_PATH + 'gray.png' + '\'/></div></div>');

    $('#filMirrors').append(newItem);

    if (!isMirrorEnable(mirror.mirrorName)) {
      $('.mirror-icon img', newItem).addClass('mirror-icon-disabled');
    }
  });

  $('.mirror-icon').click(function () {
    var $this = $(this);
    $this.toggleClass('mirror-icon-disabled');

    var disabled = $this.hasClass('mirror-icon-disabled');

    setMirrorState($this.attr('title'), !disabled);
  });

  if (typeof localStorage.getItem('searchAllRequest') !== 'undefined') {
    document.getElementById('searchBoxInput').value = localStorage.getItem('searchAllRequest');
  }

  var listTmpSearch = localStorage.getItem('searchAll');
  var listTmpSearchLst = [];

  if (listTmpSearch && listTmpSearch !== null && listTmpSearch !== 'null') {
    var lstTmp = JSON.parse(listTmpSearch);

    for (i = 0; i < lstTmp.length; i++) {
      listTmpSearchLst[i] = lstTmp[i];
    }
  }

  if (listTmpSearchLst.length > 0) {
    fillListOfSearchAll(listTmpSearchLst);
  }
}

function waitForEndLoad () {
  if (nbToLoad !== ancNbToLoad) {
    ancNbToLoad = nbToLoad;

    tempMirrorListAll.sort(function (a, b) {
      var aname = formatMgName(a.name);
      var bname = formatMgName(b.name);

      if (aname === bname) {
        if (a.mirror === b.mirror) {
          return 0;
        }
        else if (a.mirror > b.mirror) {
          return 1;
        }
        else {
          return -1;
        }
      }
      else {
        if (aname > bname) {
          return 1;
        }
        else {
          return -1;
        }
      }
    });

    var toDel = [];
    var prevName;
    var prevMirror;

    for (var k = 0; k < tempMirrorListAll.length; k++) {
      if (typeof prevName !== 'undefined' && tempMirrorListAll[k].name === prevName && tempMirrorListAll[k].mirror === prevMirror) {
        toDel[toDel.length] = k;
      }

      prevName = tempMirrorListAll[k].name;
      prevMirror = tempMirrorListAll[k].mirror;
    }

    if (toDel.length > 0) {
      for (var i = toDel.length - 1; i >= 0; i--) {
        tempMirrorListAll.remove(toDel[i], toDel[i]);
      }
    }

    fillListOfSearchAll(tempMirrorListAll);
  }

  if (nbToLoad === 0) {
    localStorage.setItem('searchAll', JSON.stringify(tempMirrorListAll));
  }
  else {
    setTimeout(waitForEndLoad, 500);
  }
}

function mangaListAllLoaded (mirror, lst) {
  for (var j = 0; j < lst.length; j++) {
    if (formatMgName(lst[j][0]).indexOf(formatMgName(curSearch)) !== -1) {
      var obj = {};
      obj.url = lst[j][1];
      obj.name = lst[j][0];
      obj.mirror = mirror;
      tempMirrorListAll[tempMirrorListAll.length] = obj;
    }
  }

  $('.mirror-icon img').each(function () {
    if ($(this).attr('title') === mirror) {
      $('img', $(this).closest('tr').next()).attr('src', IMAGE_PATH + 'blue.png');
    }
  });

  nbToLoad--;
}

function refreshSearchAll (toSearch) {
  isOver = false;
  tempMirrorListAll = [];
  nbToLoad = mirrors.length;
  ancNbToLoad = nbToLoad;
  localStorage.setItem('searchAllRequest', toSearch);

  mirrors.forEach(function (mirror) {
    var isEnabled = true;
    $('.mirror-icon img').each(function () {
      var $this = $(this);
      if ($this.attr('title') === mirror.mirrorName) {
        if ($this.hasClass('disabled')) {
          isEnabled = false;
          nbToLoad--;
          ancNbToLoad--;
        }
        else {
          $('img', $this.closest('tr').next()).attr('src', chrome.extension.getURL('img/ltload.gif'));
        }
      }
    });

    if (isEnabled) {
      if (mirror.canListFullMangas) {
        wssql.webdb.getMangaList(mirror.mirrorName, function (list, mirror) {
          if (list && list.length > 0) {
            for (var j = 0; j < list.length; j++) {
              if (formatMgName(list[j][0]).indexOf(formatMgName(toSearch)) !== -1) {
                var obj = {
                  url: list[j][1],
                  name: list[j][0],
                  mirror: mirror
                };

                tempMirrorListAll[tempMirrorListAll.length] = obj;
              }

              if (tempMirrorListAll.length > 1000) {
                isOver = true;
                nbToLoad = 0;
                break;
              }
            }
          }

          $('.mirror-icon img').each(function () {
            var $this = $(this);

            if ($this.attr('title') === mirror) {
              $('img', $this.closest('tr').next()).attr('src', IMAGE_PATH + 'blue.png');
            }
          });

          nbToLoad--;
        });
      }
      else if (mirror.getMangaList) {
        curSearch = toSearch;
        mirror.getMangaList(toSearch, mangaListAllLoaded);
      }
    }
  });

  waitForEndLoad();
}

function search () {
  var toFind = document.getElementById('searchBoxInput').value;
  if (toFind.length === 0) {
    alert('You must key something to search !');
  }
  else {
    refreshSearchAll(toFind);
  }
}
