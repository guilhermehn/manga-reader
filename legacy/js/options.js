/*globals MgUtil, translate, amrcRoot, loadMenu*/

var mirrors;
var mangas;
var actmirrors;
var i = 0;

// Opens an url in new tab
function openTab (urlToOpen) {
  chrome.runtime.sendMessage({
    action: 'opentab',
    url: urlToOpen
  }, $.noop);
}

// Saves options to localStorage. TODO: Save options using the sync call.
function saveOptions () {
  var obj = {};
  var colPicks = $('.colorPicker');
  obj.action = 'saveparameters';
  obj.displayAds = document.getElementById('adsCk').checked ? 0 : 1;
  obj.displayChapters = document.getElementById('chapsCk').checked ? 1 : 0;

  if (document.getElementById('modeChap1').checked) {
    obj.displayMode = 1;
  }
  else {
    if (document.getElementById('wideMode1').checked) {
      obj.displayMode = 2;
    }
    else {
      obj.displayMode = 3;
    }
  }

  obj.popupMode = document.getElementById('popupMode1').checked ? 1 : 2;
  obj.omSite = 0;
  obj.newTab = document.getElementById('newTab').checked ? 1 : 0;
  obj.sync = document.getElementById('syncMg').checked ? 1 : 0;
  obj.displayzero = document.getElementById('displayZero').checked ? 1 : 0;
  obj.pub = document.getElementById('pubAMR').checked ? 1 : 0;
  obj.dev = document.getElementById('devAMR').checked ? 1 : 0;
  obj.load = document.getElementById('loadCk').checked ? 1 : 0;
  obj.resize = document.getElementById('resizeCk').checked ? 1 : 0;
  obj.imgorder = document.getElementById('imgorderCk').checked ? 1 : 0;

  for (i = 0; i < colPicks.length; ++i) {
    if (colPicks[i].className.indexOf('active') !== -1) {
      obj.color = i;
      break;
    }
  }

  // New options
  obj.groupmgs = document.getElementById('groupmgsCk').checked ? 1 : 0;
  obj.openupdate = document.getElementById('openupdateCk').checked ? 1 : 0;
  obj.updatechap = parseInt(document.getElementById('updatechap').value, 10);
  obj.updatemg = parseInt(document.getElementById('updatemg').value, 10);
  obj.newbar = document.getElementById('newbarCk').checked ? 1 : 0;
  obj.addauto = document.getElementById('addautoCk').checked ? 1 : 0;

  obj.lrkeys = document.getElementById('lrkeysCk').checked ? 1 : 0;

  obj.size = parseInt(document.getElementById('popupsize').value, 10);

  obj.autobm = document.getElementById('autobmCk').checked ? 1 : 0;
  obj.prefetch = document.getElementById('prefetchCk').checked ? 1 : 0;

  obj.rightnext = document.getElementById('rightnextCk').checked ? 1 : 0;

  // Notifications
  obj.shownotifications = document.getElementById('shownotificationsCk').checked ? 1 : 0;
  obj.notificationtimer = parseInt(document.getElementById('notificationtimer').value, 10);

  obj.refreshspin = document.getElementById('refreshspinCk').checked ? 1 : 0;
  obj.checkmgstart = document.getElementById('checkmgstartCk').checked ? 1 : 0;

  obj.nocount = document.getElementById('noCount').checked ? 1 : 0;
  obj.displastup = document.getElementById('displastup').checked ? 1 : 0;
  obj.markwhendownload = document.getElementById('markwhendownload').checked ? 1 : 0;

  obj.sendstats = document.getElementById('sendstats').checked ? 1 : 0;

  obj.shownotifws = document.getElementById('shownotifws').checked ? 1 : 0;

  if (isNaN(obj.notificationtimer)) {
    obj.notificationtimer = 0;
  }

  chrome.runtime.sendMessage(obj);
}

function switchOnglet (ong, tab) {
  $('.tab').removeClass('checked');
  $(ong).addClass('checked');

  $('.ongletCont').each(function () {
    var $this = $(this);

    $this[$this.attr('id') === tab ? 'show' : 'hide']();
  });
}

function loadSelectors () {
  var selAll = $('<img src=\'' + chrome.extension.getURL('../img/select_all.png') + '\' title=\'' + translate('options_act_all') + '\'/>');
  var selNone = $('<img src=\'' + chrome.extension.getURL('../img/select_none.png') + '\' title=\'' + translate('options_deact_all') + '\'/>');
  var sel = MgUtil.getLanguageSelect(mirrors);
  var spansel = $('<span class=\'custom-select\'></span>');

  selAll.click(function () {
    $('#allmirrors tr:visible input[type=\'checkbox\']').each(function () {
      if (!$(this).is(':checked')) {
        $(this).prop('checked', true);
        var mirrorName = $('.mirrorName', $(this).parent().parent()).attr('name');
        // console.log('activate ' + mirrorName + ' ischecked : ' + $(this).is(':checked'));

        chrome.runtime.sendMessage({
          action: 'activateMirror',
          mirror: mirrorName
        }, $.noop);
      }
    });
  });

  selNone.click(function () {
    $('#allmirrors tr:visible input[type=\'checkbox\']').each(function () {
      if ($(this).is(':checked')) {
        $(this).prop('checked', false);
        var mirrorName = $('.mirrorName', $(this).parent().parent()).attr('name');
        chrome.runtime.sendMessage({
          action: 'desactivateMirror',
          mirror: mirrorName
        }, $.noop);
      }
    });
  });

  selAll.appendTo($('#selectors'));
  selNone.appendTo($('#selectors'));

  sel.change(function () {
    var lang = $('option:selected', $(this)).val();
    var langMirrors;

    if (lang === 'all') {
      $('#allmirrors tr').show();
    }
    else {
      langMirrors = MgUtil.getMirrorsFromLocale(mirrors, lang);

      $('#allmirrors tr .mirrorName').each(function () {
        var $this = $(this);
        var isFound = false;

        for (i = 0; i < langMirrors.length; ++i) {
          if (langMirrors[i] === $this.attr('name')) {
            isFound = true;
            break;
          }
        }

        $this.closest('tr')[isFound ? 'show' : 'hide']();
      });
    }
  });

  sel.appendTo(spansel);
  spansel.appendTo($('#selectors'));
}

// Used to request background page action
function sendExtRequest (request, button, callback, backsrc) {
  // Prevent a second request
  if (button.data('currentlyClicked')) {
    return;
  }
  button.data('currentlyClicked', true);

  // Display a loading image
  var ancSrc;
  if (button.is('img')) {
    ancSrc = button.attr('src');
    button.attr('src', chrome.extension.getURL('../img/load16.gif'));
  }
  else {
    if (button.is('.button')) {
      ancSrc = $('<img src=\'' + chrome.extension.getURL('../img/ltload.gif') + '\'></img>');
      ancSrc.appendTo(button);
    }
    if (button.is('.category') || button.is('.mgcategory')) {
      ancSrc = $('<img src=\'' + chrome.extension.getURL('../img/load10.gif') + '\'></img>');
      ancSrc.appendTo(button);
    }
  }
  // Call the action
  chrome.runtime.sendMessage(request, function (response) {
    // setTimeout(function() {
    // Do the callback
    callback(response);
    // Removes the loading image
    if (button.is('img')) {
      if (backsrc) {
        button.attr('src', ancSrc);
      }
    }
    else {
      if (button.is('.button') || button.is('.category') || button.is('.mgcategory')) {
        ancSrc.remove();
      }
    }
    // Restore request
    button.removeData('currentlyClicked');
    // }, 1000);
  });
}

// Activate/Deactivate mirrors
function restoreMirrors () {
  var bkg = chrome.extension.getBackgroundPage();
  mirrors = bkg.mirrors || [];
  mangas = bkg.MANGA_LIST || [];
  actmirrors = bkg.actMirrors || [];

  loadSelectors();

  mirrors.sort(function (a, b) {
    if (a.mirrorName < b.mirrorName) {
      return -1;
    }

    if (a.mirrorName === b.mirrorName) {
      return 0;
    }

    return 1;
  });

  $('#results').empty();
  $('<table id=\'allmirrors\'><thead><tr><td>' + translate('options_ws_name') + '</td><td>' + translate('options_ws_developer') + '</td><td>' + translate('options_ws_revision') + '</td><td>' + translate('options_ws_language') + '</td><td>' + translate('options_ws_activated') + '</td><td>' + translate('options_ws_discuss') + '</td></tr></thead><tbody></tbody></table>').appendTo($('#results'));

  var trCur;
  var tdHead;
  var img;
  var langstr;
  var tdMgs;
  var discuss;
  var lang;
  var nb;
  var j;
  var tdLang;
  var release;
  var isfound;
  var ck;

  for (i = 0; i < mirrors.length; ++i) {
    if (mirrors[i].mirrorName !== undefined) {
      trCur = $('<tr></tr>');
      tdHead = $('<td class=\'mirrorName\' name=\'' + mirrors[i].mirrorName + '\'></td>');
      img = $('<img src=\'' + mirrors[i].mirrorIcon + '\' title=\'' + mirrors[i].mirrorName + '\' />');
      langstr = '';
      tdMgs = $('<td class=\'mirrorOpt\'></td>');
      discuss = $('<td class=\'discusstd\'><img class=\'discuss\' src=\'' + chrome.extension.getURL('../img/comment.png') + '\' title=\'' + translate('options_ws_discuss_tit') + '\'/></td>');
      lang = mirrors[i].languages ? mirrors[i].languages.split(',') : undefined;
      nb = 0;
      j = 0;

      for (j = 0; j < mangas.length; ++j) {
        if (mangas[j].mirror === mirrors[i].mirrorName) {
          ++nb;
        }
      }

      img.appendTo(tdHead);

      $('<span><b>' + mirrors[i].mirrorName + '</b></span>').appendTo(tdHead);
      $('<span> (' + translate('options_ws_number_mg') + ' : <b>' + nb + '</b>)</span>').appendTo(tdHead);

      tdHead.appendTo(trCur);

      if (lang) {
        for (j = 0; j < lang.length; ++j) {
          langstr += MgUtil.getLanguageName(lang[j]) + ', ';
        }
      }
      else {
        langstr = '<b>ERROR</b>, ';
      }

      $('<td>' + mirrors[i].developer + '</td>').appendTo(trCur);

      if (mirrors[i].revision === 0) {
        release = $('<td><a class=\'comebacktorelease button\' title=\'' + translate('options_ws_temp') + '\'>Release</a></td>');
        release.data('idext', mirrors[i].idext);
        release.appendTo(trCur);
      }
      else {
        $('<td>' + mirrors[i].revision + '</td>').appendTo(trCur);
      }

      tdLang = $('<td class=\'lang\'>' + langstr.substr(0, langstr.length - 2) + '</td>');
      tdLang.appendTo(trCur);
      tdMgs.appendTo(trCur);
      discuss.data('idext', mirrors[i].idext);
      discuss.appendTo(trCur);

      if (nb > 0) {
        trCur.addClass('desactivate');
      }
      else if (mirrors[i].error) {
        // desactivate the mirror
        chrome.runtime.sendMessage({
          action: 'desactivateMirror',
          mirror: mirrors[i].mirrorName
        }, $.noop);

        trCur.addClass('desactivateError');
      }
      else {
        isfound = false;
        ck = $('<input type=\'checkbox\' />');

        for (j = 0; j < actmirrors.length; ++j) {
          if (actmirrors[j].mirrorName === mirrors[i].mirrorName) {
            isfound = true;
            break;
          }
        }

        ck.prop('checked', isfound);
        ck.appendTo(tdMgs);
        ck.click(function () {
          var $this = $(this);
          var mirrorName = $('.mirrorName', $this.parent().parent()).attr('name');

          // activate the mirror if is checked
          chrome.runtime.sendMessage({
            action: $this.is(':checked') ? 'activateMirror' : 'desactivateMirror',
            mirror: mirrorName
          }, $.noop);
        });
      }

      trCur.appendTo($('#allmirrors tbody'));
    }
  }

  $('.discuss').click(function () {
    var amrcAlias = 'https://community.allmangasreader.com/';
    var idext = $(this).closest('td').data('idext');

    openTab(amrcRoot.match(/ssl10\.ovh\.net/) ? amrcAlias : amrcRoot + 'comments.php?type=1&from=home&id=' + idext);
  });

  $('.comebacktorelease').click(function () {
    var $this = $(this);
    var req = {
      action: 'releaseimplementation',
      id: $this.closest('td').data('idext')
    };

    sendExtRequest(req, $this, function () {
      window.location.href = 'options.html?tab=sites';
    }, true);
  });
}

// Restores select box state to saved value from localStorage.
function restoreOptions () {
  var background = chrome.extension.getBackgroundPage();
  var response = background.getParameters();
  var colPicks;

  document.getElementById('adsCk').checked = response.displayAds !== 1;
  document.getElementById('chapsCk').checked = response.displayChapters === 1;
  document.getElementById('modeChap1').checked = response.displayMode === 1;
  document.getElementById('modeChap2').checked = response.displayMode !== 1;
  document.getElementById('wideMode1').checked = response.displayMode === 2;
  document.getElementById('wideMode2').checked = response.displayMode === 3;
  document.getElementById('popupMode1').checked = response.popupMode === 1;
  document.getElementById('popupMode2').checked = response.popupMode === 2;
  document.getElementById('newTab').checked = response.newTab !== 0;
  document.getElementById('syncMg').checked = response.sync !== 0;
  document.getElementById('displayZero').checked = response.displayzero !== 0;
  document.getElementById('pubAMR').checked = response.pub !== 0;
  document.getElementById('devAMR').checked = response.dev !== 0;
  document.getElementById('loadCk').checked = response.load !== 0;
  document.getElementById('resizeCk').checked = response.resize !== 0;
  document.getElementById('imgorderCk').checked = response.imgorder !== 0;

  // COLOR
  colPicks = $('.colorPicker');
  colPicks[response.color].className = 'colorPicker active';

  if (document.getElementById('chapsCk').checked) {
    document.getElementById('chaptersOptions').style.display = 'table-row';
  }
  if (document.getElementById('modeChap2').checked) {
    document.getElementById('wideScreenOpts').style.display = 'table-row';
  }
  if (!document.getElementById('wideMode1').checked && !document.getElementById('wideMode2').checked) {
    document.getElementById('wideMode2').checked = true;
  }

  // New options
  document.getElementById('groupmgsCk').checked = (response.groupmgs !== 0);
  document.getElementById('openupdateCk').checked = (response.openupdate !== 0);
  document.getElementById('updatechap').value = response.updatechap;
  document.getElementById('updatemg').value = response.updatemg;
  document.getElementById('newbarCk').checked = (response.newbar !== 0);
  document.getElementById('addautoCk').checked = (response.addauto !== 0);

  document.getElementById('lrkeysCk').checked = (response.lrkeys !== 0);

  document.getElementById('popupsize').value = response.size;

  document.getElementById('autobmCk').checked = (response.autobm !== 0);
  document.getElementById('prefetchCk').checked = (response.prefetch !== 0);

  document.getElementById('rightnextCk').checked = (response.rightnext !== 0);

  // Notifications
  document.getElementById('shownotificationsCk').checked = (response.shownotifications === 1);
  document.getElementById('notificationtimer').value = response.notificationtimer;

  document.getElementById('refreshspinCk').checked = (response.refreshspin === 1);
  document.getElementById('checkmgstartCk').checked = (response.checkmgstart === 1);

  document.getElementById('noCount').checked = (response.nocount === 1);
  document.getElementById('displastup').checked = (response.displastup === 1);
  document.getElementById('markwhendownload').checked = (response.markwhendownload === 1);

  document.getElementById('sendstats').checked = (response.sendstats === 1);

  document.getElementById('shownotifws').checked = (response.shownotifws === 1);

  restoreMirrors();

  $('#refreshChap').click(function () {
    chrome.extension.getBackgroundPage().refreshAllLasts(true, true);
    $('#noteChap').show();
  });

  $('#refreshMg').click(function () {
    chrome.extension.getBackgroundPage().refreshMangaLists(true, true);
    $('#noteMg').show();
  });
}

function init () {
  loadMenu('options');

  $('.article').show();
  $('.ongletCont:not(#ong1)').hide();

  if (window.location.href.indexOf('tab=sites') !== -1) {
    switchOnglet($('#supportedWS')[0], 'ong4');
  }

  restoreOptions();
}

function switchColor (selectedColor) {
  $('.colorPicker').removeClass('active');
  $(selectedColor).addClass('active');
}

// Encapsulate events binding here so it waits for the DOM to be loaded...
$(function () {
  init();

  // Change the current tab show.
  $('#mangasWS').click(function () {
    switchOnglet($(this), 'ong1');
  });

  $('#AMR_options').click(function () {
    switchOnglet($(this), 'ong2');
  });

  $('#sync').click(function () {
    switchOnglet($(this), 'ong3');
  });

  $('#supportedWS').click(function () {
    switchOnglet($(this), 'ong4');
  });

  // Fix chapters options not showing/hiding when clicking
  $('#chapsCk').on('click', function () {
    if (this.checked) {
      $('#chaptersOptions').show('table-row');
    }
    else {
      $('#chaptersOptions').hide();
    }
  });

  // Call saveOptions on every change made to input elements
  $('input').change(saveOptions);

  // Switch selected color and save options on click
  $('.colorPicker').click(function () {
    switchColor(this);
    saveOptions();
  });

  $('#updatechap')
    .add($('#updatemg'))
    .add($('#popupsize'))
    .add($('#notificationtimer'))
    .change(saveOptions);
});
