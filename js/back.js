﻿var lastpresstime;
var dirpress;
var currentMirror = null;
var amrWhereScans;
var useLeftRightKeys = false;
var autoBookmarkScans = false;
var prefetchChapter = false;
var nextRight = false;
var idStat;
var timespent = 0;
var startTime = new Date().getTime();
var updatetime = 10000;
var isActive = true;
var sendStats = false;
var times = [];
var debugTimes = false;
var timeoutAMRbar = 0;

function getMirrorScript () {
  return currentMirror;
}

function removeBanner () {
  var payload = {
    action: 'parameters'
  };

  chrome.runtime.sendMessage(payload, function (response) {
    if (response.displayAds === 0) {
      getMirrorScript().removeBanners(document, window.location.href);
    }
  });
}

function createDataDiv (res) {
  // Create modal form for bookmarks
  var divData = $('<div id=\'bookmarkData\' style=\'display:none\'><span>This div is used to store data for AMR</span></div>');

  divData.data({
    mirror: getMirrorScript().mirrorName,
    url: res.currentMangaURL,
    chapUrl: res.currentChapterURL,
    name: res.name,
    chapName: res.currentChapter
  });

  $(document.body).append(divData);
}

function stopEventProp (e) {
  e.stopPropagation();
}

function getTarget (e) {
  var evt = e || window.event;
  return evt.target || evt.srcElement;
}

function elementInViewport2 (el) {
  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;

  while (el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  top += el.offsetTop;
  left += el.offsetLeft;

  // console.log('top : ' + top + ' ; height : ' + height + ' ; wyo : ' + window.pageYOffset + ' ; wyo + wih : ' + (window.pageYOffset + window.innerHeight));
  // left < (window.pageXOffset + window.innerWidth) &&
  // (left + width) > window.pageXOffset
  return (
    top < (window.pageYOffset + window.innerHeight) &&
    (top + height) > window.pageYOffset
  );
}

function whichImageIsFirst (needFirst) {
  var resp = null;

  $('.AMRtable tr').each(function () {
    var $this = $(this);
    var isVisible = false;
    var $spanForImg = $this.find('.spanForImg');

    $spanForImg.find('img').each(function () {
      if (elementInViewport2(this)) {
        isVisible = true;
      }
    });

    if (isVisible) {
      // Sort the elements
      resp = $spanForImg.sort(function (a, b) {
        var nba = $(a).data('order');
        var nbb = $(b).data('order');

        return ((nba < nbb) ? -1 : ((nba === nbb) ? 0 : 1));
      });

      return resp[needFirst ? 'first' : 'last']();
    }
  });

  return resp;
}

function setHWZoom (img) {
  var $img = $(img);
  var data = $img.data();
  var zoom = data.zoom;

  $img.css({
    height: zoom * data.baseheight + 'px',
    width: zoom * data.basewidth + 'px',
    'max-width': 'none'
  });
}

var getBodyHeight = (function () {
  var $body = $('body');

  return function () {
    return $body.outerHeight(true);
  };
})();

function setZoom (factor) {
  var prevHeight = getBodyHeight();

  $('.imageAMR').each(function () {
    var $this = $(this);
    var zoomAccessor = $this.data.bind($this, 'zoom');
    var zoom = zoomAccessor();

    if (zoom) {
      zoomAccessor(zoom * factor);
    }
    else {
      $this.data({
        zoom: factor,
        baseheight: $this.height(),
        basewidth: $this.width()
      });
    }

    setHWZoom(this);
  });

  var actualHeight = getBodyHeight();
  var ratioY = (actualHeight / prevHeight);

  $.scrollTo('50%', {
    axis: 'x'
  });

  window.scrollBy(0, window.scrollY * (ratioY - 1));
}

var zoomIn = setZoom.bind(null, 1.2);
var zoomOut = setZoom.bind(null, 0.833);

function bottomVisible (el) {
  var top = el.offsetTop;
  var height = el.offsetHeight;

  while (el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
  }

  top += el.offsetTop;

  return (top + height) <= window.pageYOffset + window.innerHeight;
}

function topVisible (el) {
  var top = el.offsetTop;

  while (el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
  }

  top += el.offsetTop;

  return top >= (window.pageYOffset);
}

function topbotVis (spanFimg) {
  var isTopVisible = true;
  var isBotVisible = true;

  var fTop = $('img:visible', $(spanFimg)).sort(function (a, b) {
    var aTop = a.offsetTop + a.offsetParent.offsetTop;
    var bTop = b.offsetTop + b.offsetParent.offsetTop;
    return ((aTop < bTop) ? -1 : ((aTop === bTop) ? 0 : 1));
  }).first();

  //  console.log(fTop);
  if (!topVisible(fTop[0])) {
    isTopVisible = false;
  }

  var lBot = $('img:visible', $(spanFimg)).sort(function (a, b) {
    var aBot = a.offsetTop + a.offsetHeight + a.offsetParent.offsetTop + a.offsetParent.offsetHeight;
    var bBot = b.offsetTop + b.offsetHeight + b.offsetParent.offsetTop + b.offsetParent.offsetHeight;
    //  console.log('Bottom : a : ' + aBot + ' ; b : ' + bBot + ' --> ' + ((aBot < bBot) ? -1 : ((aBot == bBot) ? 0 : 1)));
    return ((aBot < bBot) ? -1 : ((aBot === bBot) ? 0 : 1));
  }).last();

  //  console.log(lBot);
  if (!bottomVisible(lBot[0])) {
    isBotVisible = false;
  }

  //  console.log({bottomVis: isBotVisible, topVis: isTopVisible});
  return {
    bottomVis: isBotVisible,
    topVis: isTopVisible
  };
}

function scrollbotoffset (el) {
  var height = el.offsetHeight;
  return height - window.innerHeight - 45;
}

function removeContextMenuEvent (selector) {
  $(selector).each(function (i, el) {
    el.oncontextmenu = null;
  });
}

function enableContextMenu () {
  document.ondragstart = null;
  document.onselectstart = null;
  document.onclick = null;
  document.onmousedown = null;
  document.onmouseup = null;
  document.oncontextmenu = null;
  document.body.oncontextmenu = null;
  removeContextMenuEvent('img, td');
}

function createBar (barVis) {
  var div = $('<div id="AMRBar"></div>');
  var divIn = $('<div id="AMRBarIn"></div>');

  var img = $('<img src="' + chrome.extension.getURL('img/icon-32.png') + '" width="20px"/>');
  img.appendTo(divIn);
  var divContent = $('<div></div>');
  divContent.appendTo(divIn);
  divContent.css('display', 'inline-block');

  var divBottom = $('<div></div>');
  divBottom.css('display', 'inline-block');
  var imgBtn = $('<img src="' + chrome.extension.getURL('img/down.png') + '" width="16px" title="Hide AMR Toolbar"/>');
  imgBtn.appendTo(divBottom);
  imgBtn.click(function () {
    chrome.runtime.sendMessage({
      action: 'hideBar'
    }, function (response) {
      if (response.res === 1) {
        if ($('#AMRBarIn').data('temporary')) {
          $('#AMRBarIn').removeData('temporary');

          if (timeoutAMRbar !== 0) {
            clearTimeout(timeoutAMRbar);
          }
        }

        $('#AMRBarInLtl').fadeOut('fast', function () {
          $('#AMRBar').css('text-align', 'center');
          $('#AMRBarIn').fadeIn();
        });
      }
      else {
        $('#AMRBarIn').fadeOut('fast', function () {
          $('#AMRBar').css('text-align', 'left');
          $('#AMRBarInLtl').fadeIn(function () {
            $(this).css('display', 'inline-block');
          });
        });
      }
    });
  });

  div.mouseenter(function () {
    if (timeoutAMRbar !== 0) {
      clearTimeout(timeoutAMRbar);
    }
    if (!$('#AMRBarIn', $(this)).is(':visible')) {
      $('#AMRBarIn').data('temporary', true);
      $('#AMRBarInLtl').fadeOut('fast', function () {
        $('#AMRBar').css('text-align', 'center');
        $('#AMRBarIn').fadeIn();
      });
    }
  });

  div.mouseleave(function () {
    if ($('#AMRBarIn').data('temporary')) {
      if (timeoutAMRbar !== 0) {
        clearTimeout(timeoutAMRbar);
      }

      timeoutAMRbar = setTimeout(function () {
        $('#AMRBarIn').removeData('temporary');
        $('#AMRBarIn').fadeOut('fast', function () {
          $('#AMRBar').css('text-align', 'left');
          $('#AMRBarInLtl').fadeIn(function () {
            $(this).css('display', 'inline-block');
          });
        });
      }, 2000);
    }
  });

  divBottom.appendTo(divIn);

  var divInLtl = $('<div id="AMRBarInLtl"></div>');
  divInLtl.css('display', 'inline-block');

  var imgLtl = $('<img src="' + chrome.extension.getURL('img/icon-32.png') + '" width="40px" title="Display AMR ToolBar"/>');
  imgLtl.css('margin-top', '-10px');
  imgLtl.css('margin-left', '-10px');
  imgLtl.css('cursor', 'pointer');

  imgLtl.appendTo(divInLtl);

  imgLtl.click(function () {
    $('#AMRBarInLtl').fadeOut('fast', function () {
      $('#AMRBar').css('text-align', 'center');
      $('#AMRBarIn').fadeIn();
      chrome.runtime.sendMessage({
        action: 'showBar'
      }, $.noop);
    });
  });

  divIn.css('display', 'inline-block');
  divIn.appendTo(div);
  divInLtl.appendTo(div);

  div.appendTo($(document.body));
  $(document.body).css({
    'background-position-y': '34px',
    'border-top': '34px solid black'
  });

  if (barVis === 0) {
    $('#AMRBar').css('text-align', 'left');
    $('#AMRBarIn').hide();
  }
  else {
    $('#AMRBar').css('text-align', 'center');
    $('#AMRBarInLtl').hide();
  }

  return divContent;
}

//  Used to request background page action
function sendExtRequest (request, button, callback, backsrc) {
  //  Prevent a second request
  if (button.data('currentlyClicked')) {
    return;
  }

  button.data('currentlyClicked', true);

  //  Display a loading image
  var ancSrc;
  if (button.is('img')) {
    ancSrc = button.attr('src');
    button.attr('src', chrome.extension.getURL('img/load16.gif'));
  }
  else {
    if (button.is('.button')) {
      ancSrc = $('<img src="' + chrome.extension.getURL('img/ltload.gif') + '"></img>');
      ancSrc.appendTo(button);
    }
    if (button.is('.category') || button.is('.mgcategory')) {
      ancSrc = $('<img src="' + chrome.extension.getURL('img/load10.gif') + '"></img>');
      ancSrc.appendTo(button);
    }
  }
  //  Call the action
  chrome.runtime.sendMessage(request, function () {
  //  setTimeout(function () {
    //  Do the callback
    callback();
    //  Removes the loading image
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
    //  Restore request
    button.removeData('currentlyClicked');
  //  }, 1000);
  });
}

function addBookmarkButton () {
  var $bookmarkData = $('#bookmarkData');
  var $data = $bookmarkData.data.bind($bookmarkData);

  var obj = {
    action: 'addUpdateBookmark',
    mirror: $data('mirror'),
    url: $data('url'),
    chapUrl: $data('chapUrl'),
    type: $data('type'),
    name: $data('name'),
    chapName: $data('chapName'),
    note: $('#noteAMR').val()
  };

  if ($data('type') !== 'chapter') {
    obj.scanUrl = $data('scanUrl');
    obj.scanName = $data('scanName');
    var imgScan = $('.spanForImg img[src="' + obj.scanUrl + '"]');
    imgScan.css('border-color', '#999999');
    if ($('#noteAMR').val() !== '') {
      imgScan.attr('title', 'Note : ' + $('#noteAMR').val());
    }
    imgScan.data('note', $('#noteAMR').val());
    imgScan.data('booked', true);
  }
  else {
    $data('note', $('#noteAMR').val());
    if ($('#noteAMR').val() !== '') {
      $('.bookAMR').attr('title', 'Note : ' + $('#noteAMR').val());
    }
    $('.bookAMR').attr('src', chrome.extension.getURL('img/bookmarkred.png'));
    $data('chapbooked', true);
  }

  chrome.runtime.sendMessage(obj, $.modal.close.bind($.modal));
}

function deleteBookmarkButton () {
  var obj = {
    action: 'deleteBookmark',
    mirror: $('#bookmarkData').data('mirror'),
    url: $('#bookmarkData').data('url'),
    chapUrl: $('#bookmarkData').data('chapUrl'),
    type: $('#bookmarkData').data('type')
  };

  if ($('#bookmarkData').data('type') !== 'chapter') {
    obj.scanUrl = $('#bookmarkData').data('scanUrl');
    var imgScan = $('.spanForImg img[src="' + obj.scanUrl + '"]');
    imgScan.css('border-color', 'white');
    imgScan.removeAttr('title');
    imgScan.removeData('booked');
  }
  else {
    $('.bookAMR')
      .removeAttr('title')
      .attr('src', chrome.extension.getURL('img/bookmark.png'));

    $('#bookmarkData').removeData('chapbooked');
  }

  chrome.runtime.sendMessage(obj, function () {});
  $.modal.close();
}

function showDialog () {
  var textDesc;
  if ($('#bookmarkData').data('type') === 'chapter') {
    textDesc = 'Bookmark chapter "' + $('#bookmarkData').data('chapName') + '" of "' + $('#bookmarkData').data('name') + '" on "' + $('#bookmarkData').data('mirror');
    textDesc += '. You can add notes below which will be associated with this bookmark.';
  }
  else {
    textDesc = 'Bookmark scan "' + $('#bookmarkData').data('scanName') + '" of chapter "' + $('#bookmarkData').data('chapName') + '" of "' + $('#bookmarkData').data('name') + '" on "' + $('#bookmarkData').data('mirror');
    textDesc += '". You can add notes below which will be associated with this bookmark.';
  }

  $('#bookmarkPop #descEltAMR').text(textDesc);
}

function addTrailingLastChap (where) {
  if ($('#nChapBtn0').length === 0) {
    $('<div style="width:100%; background-color:white; border-radius:5px;margin-top:15px;margin-bottom:15px;\"><img src="' + chrome.extension.getURL('img/warn.png') + '" style="vertical-align:middle;margin-right:10px;"/><span style="font-weight:bold;font-size:12pt;color:black;vertical-align:middle;\">This is the latest published chapter !</span></div>').appendTo(where);
  }
}

function onLoadImage () {
  if ($(this).data('canvasId')) {
    var width;
    var height;
    var ancCan = $('#' + $(this).data('canvasId'));

    var resize = $(this).data('resize');
    var mode = $(this).data('modedisplay');

    if (resize === 1) {
      if (ancCan.width() < ancCan.height()) {
        if (mode !== 1) {
          if (ancCan.width() > (screen.width - 200) / 2) {
            width = (screen.width - 200) / 2;
          }
          else {
            width = ancCan.width();
          }
        }
        else {
          if (ancCan.width() > (screen.width - 200)) {
            width = (screen.width - 200);
          }
          else {
            width = ancCan.width();
          }
        }
      }
      else {
        if (ancCan.width() > (screen.width - 200)) {
          width = (screen.width - 200);
        }
        else {
          width = ancCan.width();
        }
      }
    }
    else {
      width = ancCan.width();
    }

    height = (width / ancCan.width()) * ancCan.height();

    //  DIV VERSION
    $('div', ancCan).add($('div > img', ancCan)).each(function () {
      //  FIX CONFLICT WITH AdBlock -->
      var wori = $(this).width();
      if (wori === 0) {
        //  console.log('zero width img to ' + $(this).data('width'));
        wori = $(this).data('width');
      }
      var hori = $(this).height();
      if (hori === 0) {
        //  console.log('zero height img to ' + $(this).data('height'));
        hori = $(this).data('height');
      }
      //  ---
      var w = Math.floor((width / ancCan.width()) * wori) + 1;
      var h = Math.floor((width / ancCan.width()) * hori) + 1;

      $(this).css('width', w + 'px');
      $(this).css('height', h + 'px');
      if ($(this).css('position') === 'absolute') {
        var l = Math.floor((width / ancCan.width()) * $(this).position().left);
        if (l !== 0) {
          l++;
        }

        var t = Math.floor((width / ancCan.width()) * $(this).position().top);
        if (t !== 0) {
          t++;
        }

        $(this).css('left', l + 'px');
        $(this).css('top', t + 'px');
      }
    });

    $(ancCan).css('width', width + 'px');
    $(ancCan).css('height', height + 'px');

    $(ancCan).css('margin-bottom', '50px');
    $(ancCan).css('border', '5px solid white');
    $('#' + $(this).data('divLoad')).hide();
    $(this).data('finish', '1');
    $(this).hide();
    //  Bookmark DIV MOD ??? TODO
  }
  else {
    $('#' + $(this).data('divLoad')).hide();
    $(this).data('finish', '1');
    $(this).css('margin-right', '10px');
    if ($(this).attr('src') !== chrome.extension.getURL('img/imgerror.png')) {
      $(this).css('border', '5px solid white');
      $(this).css('margin-bottom', '50px');
    }

    //  Create contextual menu to bookmark image
    chrome.runtime.sendMessage({
      action: 'createContextMenu',
      lstUrls: [$(this).attr('src')]
    }, $.noop);

    //  Check bookmarks
    var objBM = {
      action: 'getBookmarkNote',
      mirror: $('#bookmarkData').data('mirror'),
      url: $('#bookmarkData').data('url'),
      chapUrl: $('#bookmarkData').data('chapUrl'),
      type: 'scan',
      scanUrl: $(this).attr('src'),
      scanName: $(this).data('idScan')
    };

    chrome.runtime.sendMessage(objBM, function (result) {
      if (result.isBooked) {
        var imgScan = $('.spanForImg img[src="' + result.scanSrc + '"]');
        if (imgScan.length === 0) {
          imgScan = $('.spanForImg img[src="' + decodeURI(result.scanSrc) + '"]');
        }
        imgScan.data('note', result.note);
        imgScan.data('booked', 1);
        if (result.note !== '') {
          imgScan.attr('title', 'Note : ' + result.note);
        }
        imgScan.css('border-color', '#999999');
      }
    });

    if (autoBookmarkScans) {
      $(this).dblclick(function () {
        var obj;
        if ($(this).data('booked')) {
          obj = {
            action: 'deleteBookmark',
            mirror: $('#bookmarkData').data('mirror'),
            url: $('#bookmarkData').data('url'),
            chapUrl: $('#bookmarkData').data('chapUrl'),
            type: 'scan'
          };
          obj.scanUrl = $(this).attr('src');

          $(this).css('border-top-color', 'white');
          $(this).css('border-right-color', 'white');
          $(this).css('border-bottom-color', 'white');
          $(this).css('border-left-color', 'white');
          $(this).removeAttr('title');
          $(this).removeData('booked');
          $(this).removeData('note');

          chrome.runtime.sendMessage(obj, $.noop);
        }
        else {
          obj = {
            action: 'addUpdateBookmark',
            mirror: $('#bookmarkData').data('mirror'),
            url: $('#bookmarkData').data('url'),
            chapUrl: $('#bookmarkData').data('chapUrl'),
            type: 'scan',
            name: $('#bookmarkData').data('name'),
            chapName: $('#bookmarkData').data('chapName')
          };
          obj.scanUrl = $(this).attr('src');
          obj.scanName = $(this).data('scanName');
          obj.note = '';

          $(this).css('border-color', '#999999');
          $(this).data('note', '');
          $(this).data('booked', 1);

          chrome.runtime.sendMessage(obj, $.noop);
        }
      });
    }
  }

  var divNum = $('<div class="pagenumberAMR"><div class="number">' + ($(this).data('idScan') + 1) + '</div></div>');
  divNum.appendTo($(this).closest('.spanForImg'));
}

function isLandscape (img) {
  if ($(img).data('canvasId')) {
    var can = $('#' + $(img).data('canvasId'));
    // console.log('landscape : ' + can.width() + ' --> ' + can.height());
    return can.width() > can.height();
  }
  else {
    // console.log('probleme...');
    if (parseInt($(img).css('width'), 10) > parseInt($(img).css('height'), 10)) {
      return true;
    }
    return false;
  }
}

function transformImagesInBook (where, mode, res) {
  // mode = 1 --> images are displayed on top of one another
  // mode = 2 --> images are displayed two by two occidental reading mode
  // mode = 3 --> images are displayed two by two japanese reading mode

  var nbSinglePages = 0;
  var posImg = [];
  var isFirstDouble = true;
  var isEven = true;
  // console.log('Transformation book : Nombre d'images' + $('.imageAMR', where).length);
  $('.imageAMR', where)
    .sort(function (a, b) {
      var nba = $(a).closest('.spanForImg').data('order');
      var nbb = $(b).closest('.spanForImg').data('order');
      return ((nba < nbb) ? -1 : ((nba === nbb) ? 0 : 1));
    })
    .each(function (index) {
      // console.log('setting image position...');
      if (isLandscape(this) || getMirrorScript().isImageInOneCol(this, document, window.location.href)) {
        posImg[index] = 2;

        if (isLandscape(this) && isFirstDouble) {
          if (index !== 0 && posImg[index-1] !== 1) {
            for (var i = 0; i < posImg.length; i++) {
              if (posImg[i] !== 2) {
                posImg[i] = (posImg[i]+1) % 2;
              }
            }
          }

          isFirstDouble = false;
        }

        isEven = true;
      }
      else {
        if (index === $('.imageAMR', where).length - 1 && isEven) {
          posImg[index] = 2;
        }
        else {
          posImg[index] = isEven ? 0 : 1;
          isEven = !isEven;
        }
      }
    });

  var parity = nbSinglePages % 2;

  $(where).css('text-align', 'center');
  var evenImg = null;
  var tableRes = $('<table class="AMRtable"></table>');
  tableRes.css('width', '100%');
  tableRes.css('position', 'static');

  $('.spanForImg', where)
    .sort(function (a, b) {
      var nba = $(a).data('order');
      var nbb = $(b).data('order');
      return ((nba < nbb) ? -1 : ((nba === nbb) ? 0 : 1));
    })
    .each(function (index) {
      var divMode = ($('div > img', this).data('canvasId'));
      // if (divMode) console.log('DIV MODE');
      // if (!divMode) console.log('NOT DIV MODE');

      // console.log('displaying image position...');
      var td = $('<td></td>');

      if (!divMode) {
        // $('img:first-child', this).css('margin-right', '10px');
        if ($('img:first-child', this).attr('src') !== chrome.extension.getURL('img/imgerror.png')) {
          $('img:first-child', this).css('margin-bottom', '50px');
          // $('img:first-child', this).css('border', '10px solid white');
          td.css('vertical-align', 'middle');
        }
      }
      $(this).appendTo(td);

      // console.log('Displaying ' + $('img:first-child', this).data('urlToLoad') + ' in the table');
      var trTmp;
      if (posImg[index] === 2 || mode === 1) {
        if (evenImg !== null) {
          var trForEven = $('<tr></tr>');
          trForEven.appendTo(tableRes);
          evenImg.appendTo(trForEven);
          evenImg.attr('colspan', '2');
          evenImg = null;
          if (res.resize === 1) {
            if (!divMode) {
              $('img', trForEven).css('max-width', (screen.width - 200) + 'px');
            }
          }
        }
        trTmp = $('<tr></tr>');
        trTmp.appendTo(tableRes);
        td.attr('colspan', '2');
        td.appendTo(trTmp);
        if (res.resize === 1) {
          if (!divMode) {
            $('img', trTmp).css('max-width', (screen.width - 200) + 'px');
          }
        }
      }
      else {
        if (evenImg !== null) {
          trTmp = $('<tr></tr>');
          trTmp.appendTo(tableRes);
          if (mode === 2) {
            evenImg.appendTo(trTmp);
            evenImg.css('text-align', 'right');
            td.appendTo(trTmp);
            td.css('text-align', 'left');
          }
          else {
            td.appendTo(trTmp);
            td.css('text-align', 'right');
            evenImg.appendTo(trTmp);
            evenImg.css('text-align', 'left');
          }
          if (res.resize === 1) {
            if (!divMode) {
              $('img', trTmp).css('max-width', ((screen.width-200) / 2) + 'px');
            }
          }
          evenImg = null;
        }
        else {
          if (posImg[index] === 0) {
            evenImg = td;
          }
          else {
            trTmp = $('<tr></tr>');
            trTmp.appendTo(tableRes);
            td.attr('colspan', '2');
            td.appendTo(trTmp);
            if (res.resize === 1) {
              if (!divMode) {
                $('img', trTmp).css('max-width', ((screen.width-200) / 2) + 'px');
              }
            }
          }
        }
      }
    });

  var divMode = ($('img:first-child', this).data('canvasId'));

  var td = $('<td></td>');
  if (!divMode) {
    $('img:first-child', this).css('margin-bottom', '50px');
    $('img:first-child', this).css('margin-right', '10px');
    // $('img:first-child', this).css('border', '10px solid white');
    $('img:first-child', this).appendTo(td);
  }

  if (evenImg !== null) {
    var trTmp = $('<tr></tr>');
    trTmp.appendTo(tableRes);
    if (mode === 2) {
      evenImg.appendTo(trTmp);
      evenImg.css('text-align', 'right');
      td.appendTo(trTmp);
      td.css('text-align', 'left');
    }
    else {
      td.appendTo(trTmp);
      td.css('text-align', 'right');
      evenImg.appendTo(trTmp);
      evenImg.css('text-align', 'left');
    }
    if (res.resize === 1) {
      if (!divMode) {
        $('img', trTmp).css('max-width', ((screen.width-200) / 2) + 'px');
      }
    }
    evenImg = null;
  }

  $('table', where).remove();
  tableRes.appendTo(where);
}

function writeNavigation (where, select, res, params) {
  var div = $('<div id="bookmarkPop" style="display:none"></div>');
  var btn = $('<a id="saveBtnAMR" class="buttonAMR">Save</a>');

  $('<h3>Bookmark</h3>').appendTo(div);
  $('<div id="descEltAMR"></div>').appendTo(div);
  $('<table><tr><td style="vertical-align:top"><b>Note:</b></td><td><textarea id="noteAMR" cols="50" rows="5" /></td></tr></table>').appendTo(div);

  btn.click(addBookmarkButton);

  var btndel = $('<a id="delBtnAMR" class="buttonAMR">Delete Bookmark</a>');
  btndel.click(deleteBookmarkButton);
  btndel.appendTo(div);
  btn.appendTo(div);

  var divTip = $('<div id="tipBMAMR"></div>');
  $('<span>To bookmark a scan, right click on it and choose "Bookmark in AMR".</span><br /><span>To manage bookmarks, go to </span>').appendTo(divTip);
  var aBMPage = $('<a href="#">AMR Bookmark Page</a>');

  aBMPage.click(function () {
    chrome.runtime.sendMessage({
      action: 'opentab',
      url: '/bookmarks.html'
    }, $.noop);
  });

  aBMPage.appendTo(divTip);
  divTip.appendTo(div);
  div.appendTo($(document.body));

  where.empty();
  where.each(function (index) {
    var selectIns;

    selectIns = $(select).clone();
    $(selectIns).css('float', 'none');
    $(selectIns).css('max-width', $(document).width() - 450 + 'px');
    selectIns.attr('value', $(select).children('option:selected').val());

    selectIns.change(function () {
      window.location.href = $('option:selected', $(this)).val();
    });

    var prevUrl = getMirrorScript().previousChapterUrl(selectIns, document, window.location.href);
    if (prevUrl !== null) {
      var aprev = $('<a id="pChapBtn' + index + '" class="buttonAMR" href="' + prevUrl + '">Previous</a>');
      aprev.appendTo(this);
    }

    selectIns.appendTo(this);

    var nextUrl = getMirrorScript().nextChapterUrl(selectIns, document, window.location.href);
    if (nextUrl !== null) {
      var anext = $('<a id="nChapBtn' + index + '" class="buttonAMR" href="' + nextUrl + '">Next</a>');
      anext.appendTo(this);
      $.data(document.body, 'nexturltoload', nextUrl);
    }

    // Add bookmark functionality
    var book = $('<img class="bookAMR" src="' + chrome.extension.getURL('img/bookmark.png') + '"/>');
    book.appendTo(this);
    book.click(function () {
      $('#bookmarkData').data('type', 'chapter');
      $('#noteAMR').val($('#bookmarkData').data('note'));
      if ($('#bookmarkData').data('chapbooked')) {
        $('#delBtnAMR').show();
      }
      else {
        $('#delBtnAMR').hide();
      }

      $('#bookmarkPop').modal({
        focus: false,
        onShow: showDialog,
        zIndex: 10000000
      });
    });

    if (index === 0) {
      var objBM = {
        action: 'getBookmarkNote',
        mirror: getMirrorScript().mirrorName,
        url: res.currentMangaURL,
        chapUrl: res.currentChapterURL,
        type: 'chapter'
      };

      chrome.runtime.sendMessage(objBM, function (result) {
        if (!result.isBooked) {
          $('#bookmarkData').data('note', '');
          $('.bookAMR').attr('title', 'Click here to bookmark this chapter');
        }
        else {
          $('#bookmarkData').data('note', result.note);
          if (result.note !== '') {
            $('.bookAMR').attr('title', 'Note : ' + result.note);
          }
          $('#bookmarkData').data('chapbooked', true);
          $('.bookAMR').attr('src', chrome.extension.getURL('img/bookmarkred.png'));
        }
      });
    }

    // Get specific read for currentManga
    var self = this;
    chrome.runtime.sendMessage({
      action: 'mangaInfos',
      url: res.currentMangaURL
    }, function (resp) {
      var isRead = (resp === null ? false : (resp.read === 1));
      var imgread = $('<img class="butamrread" src="' + chrome.extension.getURL('img/' + (!isRead ? 'read_stop.png' : 'read_play.png')) + '" title="' + (!isRead ? 'Stop following updates for this manga' : 'Follow updates for this manga') + '" />');
      if (resp === null && params.addauto === 0) {
        imgread.hide();
      }
      imgread.appendTo(self);
      imgread.data('mangaurl', res.currentMangaURL);

      imgread.click(function () {
        var curRead = ($(this).attr('src') === chrome.extension.getURL('img/read_play.png'));
        var obj = {
          action: 'markReadTop',
          url: $(this).data('mangaurl'),
          read: (curRead ? 0 : 1),
          updatesamemangas: true
        };

        var _but = this;
        sendExtRequest(obj, $(this), function () {
          if (curRead) {
            $(_but).attr('src', chrome.extension.getURL('img/read_stop.png'));
            $(_but).attr('title', 'Stop following updates for this manga');
          }
          else {
            $(_but).attr('src', chrome.extension.getURL('img/read_play.png'));
            $(_but).attr('title', 'Follow updates for this manga');
          }
        }, false);
      });

      // Get specific mode for currentManga
      var curmode = -1;
      if (resp !== null && resp.display) {
        curmode = resp.display;
      }

      // If not use res.mode
      if (curmode === -1) {
        curmode = params.displayMode;
      }

      // mode = 1 --> images are displayed on top of one another
      // mode = 2 --> images are displayed two by two occidental reading mode
      // mode = 3 --> images are displayed two by two japanese reading mode
      var imgmode = $('<img src="' + chrome.extension.getURL('img/' + ((curmode === 1) ? 'ontop.png' : ((curmode === 2) ? 'righttoleft.png' : 'lefttoright.png'))) + '" title="' + ((curmode === 1) ? 'Scans displayed on top of each other (click to switch display mode for this manga only)' : ((curmode === 2) ? 'Scans displayed as a book in occidental mode (left to right) (click to switch display mode for this manga only)' : 'Scans displayed as a book in japanese mode (right to left) (click to switch display mode for this manga only)')) + '" />');
      imgmode.appendTo(self);
      imgmode.data('curmode', curmode);
      imgmode.data('mangaurl', res.currentMangaURL);
      imgmode.click(function () {
        var md = $(this).data('curmode');
        var mdnext = (md % 3) + 1;
        var obj = {
          action: 'setDisplayMode',
          url: $(this).data('mangaurl'),
          display: mdnext
        };
        var _butMode = this;
        sendExtRequest(obj, $(this), function () {
          $(_butMode).data('curmode', mdnext);
          transformImagesInBook(amrWhereScans, mdnext, $(document.body).data('amrparameters'));
          if (mdnext === 1) {
            $(_butMode).attr('src', chrome.extension.getURL('img/ontop.png'));
            $(_butMode).attr('title', 'Scans displayed on top of each other (click to switch display mode for this manga only)');
          } else if (mdnext === 2) {
            $(_butMode).attr('src', chrome.extension.getURL('img/righttoleft.png'));
            $(_butMode).attr('title', 'Scans displayed as a book in occidental mode (left to right) (click to switch display mode for this manga only)');
          }
          else {
            $(_butMode).attr('src', chrome.extension.getURL('img/lefttoright.png'));
            $(_butMode).attr('title', 'Scans displayed as a book in japanese mode (right to left) (click to switch display mode for this manga only)');
          }
        }, false);
      });

      var imgstop = $('<img class="butamrstop" src="' + chrome.extension.getURL('img/stop.gif') + '" title="Mark this chapter as latest chapter read" />');
      if (resp === null && params.addauto === 0) {
        imgstop.hide();
      }
      imgstop.appendTo(self);
      imgstop.data('mangainfo', res);

      imgstop.click(function () {
        var ret = confirm('This action will reset your reading state for this manga and this chapter will be considered as the latest you have read. Do you confirm this action ?');
        if (ret) {
          var obj = {
            action: 'setMangaChapter',
            url: $(this).data('mangainfo').currentMangaURL,
            mirror: getMirrorScript().mirrorName,
            lastChapterReadName: $(this).data('mangainfo').currentChapter,
            lastChapterReadURL: $(this).data('mangainfo').currentChapterURL,
            name: $(this).data('mangainfo').name
          };

          sendExtRequest(obj, $(this), function () {}, true);
        }
      });

      if (params.addauto === 0 && resp === null) {
        var imgadd = $('<img src="' + chrome.extension.getURL('img/add.png') + '" title="Add this manga to your reading list" />');
        imgadd.appendTo(self);
        imgadd.data('mangainfo', res);

        imgadd.click(function () {
          var obj = {
            action: 'readManga',
            url: $(this).data('mangainfo').currentMangaURL,
            mirror: getMirrorScript().mirrorName,
            lastChapterReadName: $(this).data('mangainfo').currentChapter,
            lastChapterReadURL: $(this).data('mangainfo').currentChapterURL,
            name: $(this).data('mangainfo').name
          };

          var butAdd = this;
          sendExtRequest(obj, $(this), function () {
            $('.butamrstop').show();
            $('.butamrread').show();
            $(butAdd).remove();
          }, true);
        });
      }

      $(self).addClass('amrbarlayout');

      // TODO : change pub !!! (facebook + donate)...
      if (params.pub === 1) {
        var linkPub = $('<div class="titleAMRPub"></div>');
        var linkP2 = $('<span>You like reading your mangas this way with All Mangas Reader Extension, please donate !!&nbsp;&nbsp;</span><form action="https:// www.paypal.com/cgi-bin/webscr" method="post" style="display:inline-block"><input type="hidden" name="cmd" value="_s-xclick"><input type="hidden" name="hosted_button_id" value="7GQN3EZ6KK5MU"><input type="image" src="https:// www.paypalobjects.com/WEBSCR-640-20110429-1/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!"><img alt=" border="0" src="https:// www.paypalobjects.com/WEBSCR-640-20110429-1/en_US/i/scr/pixel.gif" width="1" height="1"></form>');
        linkP2.css('vertical-align', 'middle');
        linkP2.css('color', 'red!important');
        /*linkP2.click(function () {
          chrome.runtime.sendMessage({action: 'openExtensionMainPage'}, $.noop);
        });*/
        linkP2.appendTo(linkPub);
        var deletePub = $('<img src="' + chrome.extension.getURL('img/cancel.png') + '\" />');
        deletePub.attr('title', 'Remove this banner...');
        deletePub.css('cursor', 'pointer');
        deletePub.css('vertical-align', 'middle');
        deletePub.css('margin-left', '10px');

        deletePub.click(function () {
          chrome.runtime.sendMessage({
            action: 'deletepub'
          }, function () {
            $('.titleAMRPub').remove();
          });
        });

        deletePub.appendTo(linkPub);
        linkPub.appendTo(self);
      }

      var whereNavToTrail = getMirrorScript().whereDoIWriteNavigation(document, window.location.href);
      addTrailingLastChap($(whereNavToTrail).last());
    });
  });
}

function bindHotkeys () {
  //  disable default websites shortcuts (mangafox)
  document.onkeypress = null;
  document.onkeydown = null;
  document.onkeyup = null;

  $(document)
    .unbind('keyup keydown keypress')
    .keyup(stopEventProp)
    .delegate('*', 'keyup', stopEventProp)
    .keydown(function (e) {
      var t = getTarget(e);

      if (!((t.type && t.type === 'text') || t.nodeName.toLowerCase() === 'textarea')) {
        if (e.which === 87) { // W
          window.scrollBy(0, -40);
        }

        if (e.which === 83) { // S
          window.scrollBy(0, 40);
        }

        if (e.which === 107) { // +
          zoomIn();
        }

        if (e.which === 109) { // -
          zoomOut();
        }

        if (e.which === 66 && $('#pChapBtn0').length > 0) { // b
          window.location.href = $('#pChapBtn0').attr('href');
        }

        if (e.which === 78 && $('#nChapBtn0').length > 0) { // n
          window.location.href = $('#nChapBtn0').attr('href');
        }

        if (useLeftRightKeys) {
          var doubleTap;
          var nb;
          var curimg;
          var viss;

          // Left key or A
          if ((e.which === 37) || (e.which === 65)) {
            doubleTap = false;

            if (typeof lastpresstime !== undefined && new Date().getTime() - lastpresstime < 500 && dirpress === 1) {
              doubleTap = true;
            }

            dirpress = 1;
            lastpresstime = new Date().getTime();

            // Get first visible image
            curimg = whichImageIsFirst(true);
            if (curimg !== null && curimg.length > 0) {
              // Check if top and bottom of this image are visible
              viss = topbotVis(curimg);

              // If top not visible
              if (!viss.topVis && !doubleTap) {
                // Move to top of current scan
                $.scrollTo($(curimg).closest('tr')[0], 800, {
                  queue: true
                });
              }
              else {
                // Calculate previous scan id
                nb = curimg.data('order') - 1;

                if (nb === -1) {
                  // Current scan was first scan, move to top
                  $.scrollTo($(document.body), 800, {
                    queue: true
                  });
                }
                else {
                  // Move to bottom of previous scan
                  $('.spanForImg').each(function () {
                    var $this = $(this);
                    var closest;

                    if ($(this).data('order') === nb) {
                      closest = $this.closest('tr').get(0);

                      $.scrollTo(closest, 800, {
                        queue: true,
                        offset: {
                          top: scrollbotoffset(closest)
                        }
                      });
                    }
                  });
                }
              }
            }

            e.preventDefault();
            e.stopPropagation();
          }
          // Right key or D
          if ((e.which === 39) || (e.which === 68)) {
            doubleTap = false;

            if (lastpresstime !== undefined && new Date().getTime() - lastpresstime < 500 && dirpress !== undefined && dirpress === 2) {
              doubleTap = true;
            }

            lastpresstime = new Date().getTime();
            dirpress = 2;

            // If we are at top of the page --> move to first scan
            if (window.pageYOffset === 0) {
              nb = 0;

              $('.spanForImg').each(function () {
                if ($(this).data('order') === nb) {
                  $.scrollTo($(this).closest('tr')[0], 800, {
                    queue: true
                  });
                }
              });
            }
            else {
              var hiddenDocumentSize = document.documentElement.scrollHeight - window.innerHeight;

              if (window.pageYOffset >= hiddenDocumentSize && nextRight && $('#nChapBtn0').length > 0) {
                window.location.href = $('#nChapBtn0').attr('href');
              }

              // Get first visible image
              curimg = whichImageIsFirst(false);
              if (curimg !== null && curimg.length > 0) {
                // Check if top and bottom of this image are visible
                viss = topbotVis(curimg[0]);

                // If bottom not visible
                if (!viss.bottomVis && !doubleTap) {
                  // Move to bottom of current scan
                  $.scrollTo($(curimg).closest('tr')[0], 800, {
                    queue: true,
                    offset: {
                      top: scrollbotoffset($(curimg).closest('tr')[0])
                    }
                  });
                }
                else {
                  // Calculate next scan id
                  nb = curimg.data('order') + 1;
                  if (nb >= $('.spanForImg').length) {
                    // Current scan was last scan -> move to bottom of page
                    $.scrollTo($(document.body), 800, {
                      queue: true,
                      offset: {
                        top: document.body.offsetHeight
                      }
                    });
                  }
                  else {
                    //  Move to top of next scan
                    $('.spanForImg').each(function () {
                      if ($(this).data('order') === nb) {
                        $.scrollTo($(this).closest('tr')[0], 800, {
                          queue: true
                        });
                      }
                    });
                  }
                }
              }
            }
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    });

  var timer = setInterval(function () {
    if (/loaded|complete/.test(document.readyState)) {
      clearInterval(timer);
      enableContextMenu();
    }
  }, 100);
}

function callbackListChaps (list, select) {
  var hasSelected = false;
  var $select = $(select);
  var mangaCurUrl = $select.data('mangaCurUrl');
  var option;

  list.forEach(function (item) {
    option = $('<option value="' + item[1] + '">' + item[0] + '</option>');

    if (mangaCurUrl.indexOf(item[1]) !== -1 && !hasSelected) {
      option.attr('selected', true);

      if (mangaCurUrl === item[1]) {
        hasSelected = true;
      }
    }

    $select.append(option);
  });

  chrome.runtime.sendMessage({
    action: 'parameters'
  }, function (response) {
    var whereNav;

    if (response.newbar === 1) {
      chrome.runtime.sendMessage({
        action: 'barState'
      }, function (barState) {
        whereNav = createBar(barState.barVis);
        writeNavigation(whereNav, select, $.data(document.body, 'curpageinformations'), response);
      });
    }
    else {
      whereNav = getMirrorScript().whereDoIWriteNavigation(document, window.location.href);
      writeNavigation(whereNav, select, $.data(document.body, 'curpageinformations'), response);
    }
  });
}

function updateStat (estimated) {
  estimated = estimated || false;
  var tosend = timespent;

  if (estimated && isActive) {
    tosend += new Date().getTime() - startTime;
  }

  var statobj = {
    action: 'updateMgForStat',
    id: idStat,
    time_spent: tosend
  };

  if (sendStats) {
    chrome.runtime.sendMessage(statobj, $.noop);
  }

  setTimeout(updateStat, updatetime);
}

function bindCalculateTime () {
  window.onbeforeunload = function () {
    if (isActive) {
      var now = new Date().getTime();
      if (debugTimes) {
        times[times.length] = now - startTime;
      }
      timespent += now - startTime;
      startTime = now;
    }
    updateStat();
    if (debugTimes) {
      var res = '';
      for (var i = 0; i < times.length; i++) {
        res += times[i] + ', ';
      }
      res += ' --> ' + timespent;
      return res;
    }
  };

  $(window)
    .focus(function () {
      startTime = new Date().getTime();
      isActive = true;
    })
    .blur(function () {
      var now = new Date().getTime();

      if (debugTimes) {
        times[times.length] = now - startTime;
      }

      timespent += now - startTime;
      startTime = now;

      isActive = false;
    });
}

function onErrorImage () {
  var $this = $(this);

  $this.css({
    'margin-bottom': '50px',
    'margin-right': '10px'
  });

  if (this.naturalWidth === 0) {
    //  Here, number of tries before considering image can not be loaded
    if ($this.data('number') === 2) {
      console.log('Image has not been recovered');
      $this.attr('src', chrome.extension.getURL('img/imgerror.png'));

      $this.css({
        border: 0,
        margin: 0
      });

      $this.data('finish', '1');

      $('#' + $this.data('divLoad')).hide();

      //  Create the reload button
      var butReco = $('<a class="buttonAMR">Try to reload</a>');

      butReco.css({
        display: 'block',
        'max-width': '200px',
        'margin-left': 'auto',
        'margin-right': 'auto'
      });

      $this.after(butReco);

      butReco.click(function () {
        var $this = $(this);

        var imgAnc = $this.prev();
        var url = $(imgAnc).data('urlToLoad');
        var divLoadId = $(imgAnc).data('divLoad');
        var idScan = $(imgAnc).data('idScan');
        var spanner = $this.parent();
        spanner.empty();

        var img = new Image();
        var $img = $(img);

        $img.data('urlToLoad', url);
        $img.css('border', '5px solid white');
        $img.load(onLoadImage);
        $img.error(onErrorImage);

        getMirrorScript().getImageFromPageAndWrite(url, img, document, window.location.href);

        spanner.append($img);

        var div = $('<div id="' + divLoadId + '" class="divLoading"></div>');
        div.css('background', 'url(' + chrome.extension.getURL('img/loading.gif') + ') no-repeat center center');

        $img.data({
          idScan: idScan,
          divLoad: divLoadId
        });

        spanner.append(div);
      });
    }
    else {
      //  console.log('An image has encountered a problem while loading... All Mangas Reader is trying to recover it...');
      var imgSave = new Image();
      var $imgSave = $(imgSave);

      if ($this.data('hasErrors') !== '1') {
        $imgSave.data('hasErrors', '1');
        $imgSave.data('number', 1);
      }
      else {
        $imgSave.data('hasErrors', '1');
        $imgSave.data('number', $this.data('number') + 1);
      }

      $imgSave.data('divLoad', $this.data('divLoad'));
      $imgSave.data('idScan', $this.data('idScan'));

      //  == loadImage
      $imgSave.data('urlToLoad', $this.data('urlToLoad'));
      $imgSave.css('border', '5px solid white');
      $imgSave.load(onLoadImage);
      $imgSave.error(onErrorImage);
      getMirrorScript().getImageFromPageAndWrite($this.data('urlToLoad'), imgSave, document, window.location.href);

      $this.after($imgSave);
      $this.remove();
    }
  }
  else {
    $('#' + $this.data('divLoad')).hide();

    $this.data({
      finish: 1,
      error: 1
    });
  }
}

function nbLoaded (where) {
  var loaded = $(where)
    .find('.imageAMR')
    .filter(function () {
      return $(this).data('finish') === 1;
    });

  return loaded.length;
}

function loadImageAMR (where, url, img, pos, res, mode, second) {
  if (!second) {
    $(img).data('urlToLoad', url);
    $(img).data('resize', res.resize);
    $(img).data('modedisplay', mode);

    $(img).load(onLoadImage);
    $(img).error(onErrorImage);
  }

  if (res.imgorder === 1) {
    if (nbLoaded(where) === pos) {
      getMirrorScript().getImageFromPageAndWrite(url, img, document, window.location.href);
    }
    else {
      setTimeout(function () {
        loadImageAMR(where, url, img, pos, res, mode, true);
      }, 100);
    }
  }
  else {
    getMirrorScript().getImageFromPageAndWrite(url, img, document, window.location.href);
  }
}

function onLoadNextImage () {
  var lstbtn = [];
  var id = 'nChapBtn';
  var i = 0;
  while ($('#' + id + i).length > 0) {
    lstbtn[lstbtn.length] = $('#' + id + i);
    i++;
  }
  var self = this;
  $.each(lstbtn, function () {
    var $this = $(this);
    if ($this.data('nbloaded')) {
      $this.data('nbloaded', $this.data('nbloaded') + 1);
    }
    else {
      $this.data('nbloaded', 1);
    }
    var prog;
    if ($('.AMRprogress', $this).length === 0) {
      prog = $('<span class="buttonAMR AMRprogress></span>');
      prog.css('position', 'relative');
      prog.css('top', '0');
      prog.css('left', '0');
      prog.css('width', '0px');
      prog.css('height', '4px');
      prog.css('border-radius', '2px');
      prog.css('border-radius', '2px');
      prog.css('background-color', '#8888EE');
      prog.css('opacity', '1');
      prog.css('display', 'block');

      prog.appendTo($this);
    }
    else {
      prog = $('.AMRprogress', $this);
    }
    //  console.log((this[0].offsetWidth * ($this.data('nbloaded') / $(self).data('total'))) + ' --> ' + $this.data('nbloaded') + ' ; ' + $(self).data('total'));
    prog.css('width', (this[0].offsetWidth * ($this.data('nbloaded') / $(self).data('total'))) + 'px');
  });
}

function onErrorNextImage () {
  //  TODO retry...
}

function loadNextChapter (urlNext) {
  //  load an iframe with urlNext and get list of images
  chrome.runtime.sendMessage({
    action: 'getNextChapterImages',
    url: urlNext,
    mirrorName: getMirrorScript().mirrorName
  }, function (resp) {
    var lst = resp.images;

    if (lst !== null) {
      for (var i = 0; i < lst.length; i++) {
        var img = new Image();

        $(img)
          .load(onLoadNextImage)
          .error(onErrorNextImage)
          .data({
            attempts: 0,
            id: i,
            urltoload: lst[i],
            urlnext: urlNext,
            total: lst.length
          });

        getMirrorScript().getImageFromPageAndWrite(lst[i], img, document, urlNext);
      }
    }
  });
}

function waitForImages (where, mode, res, title) {
  var isOk = true;
  var nbOk = 0;
  var nbTot = 0;

  $(where).find('.imageAMR').each(function () {
    if ($(this).data('finish') !== 1) {
      isOk = false;
    }
    else {
      nbOk++;
    }
    if (this.offsetWidth !== $(this).data('owidth')) {
      $('#' + $(this).data('divLoad')).hide();
    }
    nbTot++;
  });

  if (res.load === 1 && nbTot !== 0) {
    $('title').text(Math.floor(nbOk / nbTot * 100) + ' % - ' + title);
  }

  if (isOk) {
    transformImagesInBook(where, mode, res);
    getMirrorScript().doAfterMangaLoaded(document, window.location.href);

    $('title').text(title);

    if ($.data(document.body, 'nexturltoload') && prefetchChapter) {
      loadNextChapter($.data(document.body, 'nexturltoload'));
    }

    if ($.data(document.body, 'sendwhendownloaded')) {
      chrome.runtime.sendMessage($.data(document.body, 'sendwhendownloaded'), $.noop);
    }
  }
  else {
    setTimeout(waitForImages.bind(null, where, mode, res, title), 500);
  }
}

function writeImages (where, list, mode, res) {
  var table = $('<table class="AMRtable"></table>');
  var tr;
  var td;
  var spanner;
  var div;
  var img;

  table.css('text-align', 'center');
  table.css('position', 'static');
  table.css('width', '100%');
  table.appendTo(where);

  for (var i = 0; i < list.length; i++) {
    tr = $('<tr></tr>');
    tr.appendTo(table);

    td = $('<td></td>');
    td.css('text-align', 'center');
    td.appendTo(tr);

    spanner = $('<div class="spanForImg"></div>');

    spanner
      .css({
        'vertical-align': 'middle',
        'text-align': 'center'
      })
      .data('order', i);

    td.append(spanner);

    div = $('<div id="loader' + i + '" class="divLoading"></div>');
    div.css('background', 'url(' + chrome.extension.getURL('img/loading.gif') + ') no-repeat center center');

    spanner.append(div);

    //  Using $ to create this image instead of DOM native method fix a
    // weird bug on canary and only some websites.
    // My thought is that a version of canary was mistaking the embedded $
    // on the website and when the extension creates image from DOM and container
    // from website's $. We can't have both of them interract (DOM restriction)
    // It might be a Canary issue more than an AMR issue... Here it is fixed...
    img = new Image();

    $(img)
      .addClass('imageAMR')
      .data({
        owidth: img.offsetWidth,
        divLoad: 'loader' + i,
        idScan: i
      });

    loadImageAMR(where, list[i], img, i, res, mode);

    spanner.append(img);
  }

  var title = $('title').text();
  waitForImages(where, mode, res, title);
}

function initPage () {
  var mirrorScript = getMirrorScript();

  if (mirrorScript.isCurrentPageAChapterPage(document, window.location.href)) {
    bindHotkeys();

    chrome.runtime.sendMessage({
      action: 'parameters'
    }, function (response) {
      useLeftRightKeys = response.lrkeys === 1;
      autoBookmarkScans = response.autobm === 1;
      prefetchChapter = response.prefetch === 1;
      nextRight = response.rightnext === 1;
      sendStats = response.sendstats === 1;

      var $body = $(document.body);

      mirrorScript.getInformationsFromCurrentPage(document, window.location.href, function (res) {
        $body.data('curpageinformations', res);

        chrome.runtime.sendMessage({
          action: 'mangaInfos',
          url: res.currentMangaURL
        }, function (resp) {
          chrome.runtime.sendMessage({
            action: 'barState'
          }, function (barState) {
            createDataDiv(res);
            var imagesUrl = mirrorScript.getListImages(document, window.location.href);
            var select = mirrorScript.getMangaSelectFromPage(document, window.location.href);
            var isSel = true;

            if (select === null) {
              var selectIns = $('<select></select>');
              selectIns.data('mangaCurUrl', res.currentChapterURL);
              mirrorScript.getListChaps(res.currentMangaURL, res.name, selectIns, callbackListChaps);
              isSel = false;
            }

            mirrorScript.doSomethingBeforeWritingScans(document, window.location.href);

            if (isSel) {
              var whereNav;
              if (response.newbar === 1) {
                whereNav = createBar(barState.barVis);
              }
              else {
                whereNav = mirrorScript.whereDoIWriteNavigation(document, window.location.href);
              }

              writeNavigation(whereNav, select, res, response);
            }

            var where = mirrorScript.whereDoIWriteScans(document, window.location.href);
            amrWhereScans = where;

            $body.data('amrparameters', response);

            //  Get specific mode for currentManga
            var curmode = -1;
            if (resp !== null && resp.display) {
              curmode = resp.display;
            }

            //  If not use res.mode
            if (curmode === -1) {
              curmode = response.displayMode;
            }

            writeImages(where, imagesUrl, curmode, response);
          });

          var payload = {
            action: 'readManga',
            url: res.currentMangaURL,
            mirror: mirrorScript.mirrorName,
            lastChapterReadName: res.currentChapter,
            lastChapterReadURL: res.currentChapterURL,
            name: res.name
          };

          if (response.addauto === 1 || resp !== null) {
            switch (response.markwhendownload) {
              case 0: {
                chrome.runtime.sendMessage(payload, $.noop);
                break;
              }

              case 1: {
                $.data(document.body, 'sendwhendownloaded', payload);
                break;
              }
            }
          }

          if (sendStats) {
            var statobj = {
              action: 'readMgForStat',
              url: res.currentMangaURL,
              mirror: mirrorScript.mirrorName,
              lastChapterReadName: res.currentChapter,
              lastChapterReadURL: res.currentChapterURL,
              name: res.name
            };

            chrome.runtime.sendMessage(statobj, function (response) {
              idStat = response.id;
              bindCalculateTime();
              setTimeout(updateStat.bind(null, true), updatetime);
            });
          }
        });
      });
    });
  }
}

function clickOnBM (src) {
  var imgScan = $('.spanForImg img[src="' + src + '"]');
  var $bookmarkData = $('#bookmarkData');

  if (imgScan.length === 0) {
    imgScan = $('.spanForImg img[src="' + decodeURI(src) + '"]');
  }

  var imgScanData = imgScan.data();

  $bookmarkData.data({
    type: 'scan',
    scanUrl: src,
    scanName: imgScan.data('idScan')
  });

  $('#noteAMR').val(imgScanData.hasOwnProperty('note') ? imgScanData.note : '');

  $('#delBtnAMR')[imgScanData.booked ? 'show' : 'hide']();

  $('#bookmarkPop').modal({
    focus: false,
    onShow: showDialog,
    zIndex: 10000000
  });
}

function resetZoom () {
  $('.imageAMR').each(function () {
    if (this.style.zoom !== 0) {
      this.style.zoom *= 0;
    }
  });
}

/*
  How does this works.... and this is the only way to load a remote script and
  use it in a page like that...
  - Call background page with current url to see if it matches
  - if url matches, bakground page loads the script from remote server and call
  chrome.tabs.executeScript(current tab) to execute it in this context...
  - the script contains a call to registerMangaObject
  - the content script stores the object

  --> NO CALL TO EVAL and get the remote object...
*/
function registerMangaObject (mirrorName, object) {
  currentMirror = object;
}
