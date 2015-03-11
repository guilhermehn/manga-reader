var lastpresstime;
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

var IMAGE_PATH = chrome.extension.getURL('../img/');

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

function stopEventPropagation (e) {
  e.stopPropagation();
}

function elementInViewport2 (el) {
  var top = el.offsetTop;
  var left = el.offsetLeft;
  var height = el.offsetHeight;

  while (el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  top += el.offsetTop;
  left += el.offsetLeft;

  return top < (window.pageYOffset + window.innerHeight) && (top + height) > window.pageYOffset;
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

function setHWZoom (img, zoomFactor) {
  var $img = $(img);
  var data = $img.data();

  $img.css({
    height: zoomFactor * data.baseheight + 'px',
    width: zoomFactor * data.basewidth + 'px',
    'max-width': 'none'
  });
}

var getBodyHeight = (function () {
  return function () {
    return $('body').outerHeight(true);
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
        baseheight: $this.height(),
        basewidth: $this.width()
      });
    }

    setHWZoom(this, factor);
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

function sumOffsets (el) {
  return el.offsetTop + el.offsetHeight + el.offsetParent.offsetTop + el.offsetParent.offsetHeight;
}

function topbotVis (spanFimg) {
  var isTopVisible = true;
  var isBotVisible = true;
  var visibleImages = $(spanFimg).find('img:visible');

  var fTop = visibleImages.sort(function (a, b) {
    var aTop = a.offsetTop + a.offsetParent.offsetTop;
    var bTop = b.offsetTop + b.offsetParent.offsetTop;
    return aTop < bTop ? -1 : (aTop === bTop ? 0 : 1);
  }).first();

  if (!topVisible(fTop[0])) {
    isTopVisible = false;
  }

  var lBot = visibleImages.sort(function (a, b) {
    var aBot = sumOffsets(a);
    var bBot = sumOffsets(b);
    return aBot < bBot ? -1 : (aBot === bBot ? 0 : 1);
  }).last();

  if (!bottomVisible(lBot[0])) {
    isBotVisible = false;
  }

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

function createBar (isBarVisible) {
  var div = $('<div id="AMRBar"></div>');
  var divIn = $('<div id="AMRBarIn"></div>');
  var $AMRBar = $('#AMRBar');

  var img = $('<img src="' + IMAGE_PATH + 'icon-32.png' + '" width="20px"/>');
  divIn.append(img);

  var divContent = $('<div></div>');
  divContent.css('display', 'inline-block');
  divIn.append(divContent);

  var divBottom = $('<div></div>');
  divBottom.css('display', 'inline-block');

  var imgBtn = $('<img src="' + IMAGE_PATH + 'down.png' + '" width="16px" title="Hide AMR Toolbar"/>');

  divBottom.append(imgBtn);

  imgBtn.on('click', function () {
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

  div.on('mouseenter', function () {
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

  div.on('mouseleave', function () {
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

  divIn.append(divBottom);

  var divInLtl = $('<div id="AMRBarInLtl"></div>');
  divInLtl.css('display', 'inline-block');

  var imgLtl = $('<img src="' + chrome.extension.getURL('../img/icon-32.png') + '" width="40px" title="Display AMR ToolBar"/>');

  imgLtl.css({
    'margin-top': '-10px',
    'margin-left': '-10px',
    cursor: 'pointer'
  });

  divInLtl.append(imgLtl);

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

  div
    .append(divIn)
    .append(divInLtl);

  $(document.body)
    .append(div)
    .css({
      'background-position-y': '34px',
      'border-top': '34px solid black'
    });

  if (isBarVisible === 0) {
    $AMRBar.css('text-align', 'left');
    $('#AMRBarIn').hide();
  }
  else {
    $AMRBar.css('text-align', 'center');
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
    button.attr('src', chrome.extension.getURL('../img/load16.gif'));
  }
  else {
    if (button.is('.button')) {
      ancSrc = $('<img src="' + chrome.extension.getURL('../img/ltload.gif') + '"></img>');
      ancSrc.appendTo(button);
    }
    if (button.is('.category') || button.is('.mgcategory')) {
      ancSrc = $('<img src="' + chrome.extension.getURL('../img/load10.gif') + '"></img>');
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

    $('.bookAMR').attr('src', chrome.extension.getURL('../img/bookmarkred.png'));
    $data('chapbooked', true);
  }

  chrome.runtime.sendMessage(obj, $.modal.close.bind($.modal));
}

function deleteBookmarkButton () {
  var $bookmarkData = $('#bookmarkData');
  var data = $bookmarkData.data();

  var obj = {
    action: 'deleteBookmark',
    mirror: data.mirror,
    url: data.url,
    chapUrl: data.chapUrl,
    type: data.type
  };

  if (data.type !== 'chapter') {
    obj.scanUrl = data.scanUrl;

    $('.spanForImg img[src="' + obj.scanUrl + '"]')
      .css('border-color', 'white')
      .removeAttr('title')
      .removeData('booked');
  }
  else {
    $('.bookAMR')
      .removeAttr('title')
      .attr('src', IMAGE_PATH + 'bookmark.png');

    $bookmarkData.removeData('chapbooked');
  }

  chrome.runtime.sendMessage(obj, function () {});
  $.modal.close();
}

function showDialog () {
  var textDesc;
  var data = $('#bookmarkData').data();

  if (data.type === 'chapter') {
    textDesc = ['Bookmark chapter "', data.chapName, '" of "', data.name, '" on "', data.mirror, '. You can add notes below which will be associated with this bookmark.'];
  }
  else {
    textDesc = ['Bookmark scan "', data.scanName, '" of chapter "', data.chapName, '" of "', data.name, '" on "', data.mirror, '". You can add notes below which will be associated with this bookmark.'];
  }

  $('#bookmarkPop #descEltAMR').text(textDesc.join(''));
}

function addTrailingLastChap (where) {
  if ($('#nChapBtn0').length === 0) {
    $(where).append('<div style="width:100%; background-color:white; border-radius:5px;margin-top:15px;margin-bottom:15px;\"><img src="' + chrome.extension.getURL('../img/warn.png') + '" style="vertical-align:middle;margin-right:10px;"/><span style="font-weight:bold;font-size:12pt;color:black;vertical-align:middle;\">This is the latest published chapter !</span></div>');
  }
}

function onLoadImage () {
  var $this = $(this);
  var $data = $this.data();
  var src;
  var $bookmarkData;

  if ($data.canvasId) {
    var width;
    var height;
    var ancCan = $('#' + $data.canvasId);

    var resize = $data.resize;
    var mode = $data.modedisplay;

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
    ancCan
      .find('div, div > img')
      .each(function () {
        //  FIX CONFLICT WITH AdBlock -->
        var $this = $(this);
        var originalWidth = $this.width();

        if (originalWidth === 0) {
          originalWidth = $this.data('width');
        }

        var originalHeight = $this.height();
        if (originalHeight === 0) {
          originalHeight = $this.data('height');
        }

        //  ---
        var w = Math.floor((width / ancCan.width()) * originalWidth) + 1;
        var h = Math.floor((width / ancCan.width()) * originalHeight) + 1;

        $this.css('width', w + 'px');
        $this.css('height', h + 'px');
        if ($this.css('position') === 'absolute') {
          var l = Math.floor((width / ancCan.width()) * $this.position().left);
          if (l !== 0) {
            l++;
          }

          var t = Math.floor((width / ancCan.width()) * $this.position().top);
          if (t !== 0) {
            t++;
          }

          $this.css('left', l + 'px');
          $this.css('top', t + 'px');
        }
      });

    $(ancCan).css('width', width + 'px');
    $(ancCan).css('height', height + 'px');

    $(ancCan).css('margin-bottom', '50px');
    $(ancCan).css('border', '5px solid white');
    $('#' + $(this).data('divLoad')).hide();
    $(this).data('finish', '1');
    $(this).hide();
  }
  else {
    src = $this.attr('src');

    $('#' + $data.divLoad).hide();

    $this
      .data('finish', '1')
      .css('margin-right', '10px');

    if (src !== chrome.extension.getURL('../img/imgerror.png')) {
      $this.css({
        border: '5px solid white',
        'margin-bottom': '50px'
      });
    }

    //  Create contextual menu to bookmark image
    chrome.runtime.sendMessage({
      action: 'createContextMenu',
      lstUrls: [src]
    }, $.noop);

    $bookmarkData = $('#bookmarkData');

    //  Check bookmarks
    var getBookmarkNotePayload = {
      action: 'getBookmarkNote',
      mirror: $bookmarkData.data('mirror'),
      url: $bookmarkData.data('url'),
      chapUrl: $bookmarkData.data('chapUrl'),
      type: 'scan',
      scanUrl: src,
      scanName: $data.idScan
    };

    chrome.runtime.sendMessage(getBookmarkNotePayload, function (result) {
      if (result.isBooked) {
        var imgScan = $('.spanForImg img[src="' + result.scanSrc + '"]');

        if (imgScan.length === 0) {
          imgScan = $('.spanForImg img[src="' + decodeURI(result.scanSrc) + '"]');
        }

        imgScan.data({
          booked: 1,
          note: result.note
        });

        if (result.note !== '') {
          imgScan.attr('title', 'Note : ' + result.note);
        }

        imgScan.css('border-color', '#999');
      }
    });

    if (autoBookmarkScans) {
      // Bookmark the image on doubleclick
      $this.on('dblclick', function () {
        var $this = $(this);
        var obj;

        if ($this.data('booked')) {
          obj = {
            action: 'deleteBookmark',
            mirror: $bookmarkData.data('mirror'),
            url: $bookmarkData.data('url'),
            chapUrl: $bookmarkData.data('chapUrl'),
            type: 'scan',
            scanUrl: src
          };

          $this
            .css('border-color', '#fff')
            .removeAttr('title')
            .removeData('booked')
            .removeData('note');

          chrome.runtime.sendMessage(obj, $.noop);
        }
        else {
          obj = {
            action: 'addUpdateBookmark',
            mirror: $bookmarkData.data('mirror'),
            url: $bookmarkData.data('url'),
            chapUrl: $bookmarkData.data('chapUrl'),
            type: 'scan',
            name: $bookmarkData.data('name'),
            chapName: $bookmarkData.data('chapName'),
            scanUrl: $this.attr('src'),
            scanName: $this.data('scanName'),
            note: ''
          };

          $this
            .css('border-color', '#999999')
            .data({
              note: '',
              booked: 1
            });

          chrome.runtime.sendMessage(obj, $.noop);
        }
      });
    }
  }

  var divNum = $('<div class="pagenumberAMR"><div class="number">' + ($this.data('idScan') + 1) + '</div></div>');
  $this.closest('.spanForImg').append(divNum);
}

function isLandscape (img) {
  var $img = $(img);

  if ($img.data('canvasId')) {
    var can = $('#' + $img.data('canvasId'));

    return can.width() > can.height();
  }
  else {
    if (parseInt($img.css('width'), 10) > parseInt($img.css('height'), 10)) {
      return true;
    }
  }

  return false;
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

  $(where).css('text-align', 'center');
  var evenImg = null;
  var tableRes = $('<table class="AMRtable"></table>');
  tableRes.css('width', '100%');
  tableRes.css('position', 'static');

  $('.spanForImg', where)
    .sort(function (a, b) {
      var nba = $(a).data('order');
      var nbb = $(b).data('order');
      return nba < nbb ? -1 : (nba === nbb ? 0 : 1);
    })
    .each(function (index) {
      var divMode = ($('div > img', this).data('canvasId'));
      var td = $('<td></td>');

      if (!divMode) {
        if ($('img:first-child', this).attr('src') !== chrome.extension.getURL('../img/imgerror.png')) {
          $('img:first-child', this).css('margin-bottom', '50px');
          td.css('vertical-align', 'middle');
        }
      }

      td.append(this);

      var trTmp;
      if (posImg[index] === 2 || mode === 1) {
        if (evenImg !== null) {
          var trForEven = $('<tr></tr>');
          trForEven.appendTo(tableRes);
          evenImg.appendTo(trForEven);
          evenImg.attr('colspan', '2');
          evenImg = null;

          if (res.resize === 1 && !divMode) {
            $('img', trForEven).css('max-width', (screen.width - 200) + 'px');
          }
        }

        trTmp = $('<tr></tr>');
        trTmp.appendTo(tableRes);
        td.attr('colspan', '2');
        td.appendTo(trTmp);

        if (res.resize === 1 && !divMode) {
          $('img', trTmp).css('max-width', (screen.width - 200) + 'px');
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

          if (res.resize === 1 && !divMode) {
            $('img', trTmp).css('max-width', ((screen.width - 200) / 2) + 'px');
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

            if (res.resize === 1 && !divMode) {
              $('img', trTmp).css('max-width', ((screen.width - 200) / 2) + 'px');
            }
          }
        }
      }
    });

  var divMode = ($('img:first-child', this).data('canvasId'));
  var td = $('<td></td>');

  if (!divMode) {
    $(this)
      .find('img:first-child')
      .css({
        'margin-bottom': '50px',
        'margin-right': '10px'
      })
      .appendTo(td);
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

    if (res.resize === 1 && !divMode) {
      $('img', trTmp).css('max-width', ((screen.width - 200) / 2) + 'px');
    }

    evenImg = null;
  }

  $('table', where).remove();
  tableRes.appendTo(where);
}

function writeNavigation (where, select, res, params) {
  var div = $('<div id="bookmarkPop" style="display:none"></div>');
  var btn = $('<a id="saveBtnAMR" class="buttonAMR">Save</a>');

  div
    .append('<h3>Bookmark</h3>')
    .append('<div id="descEltAMR"></div>')
    .append('<table><tr><td style="vertical-align:top"><b>Note:</b></td><td><textarea id="noteAMR" cols="50" rows="5" /></td></tr></table>');

  btn.click(addBookmarkButton);

  var btndel = $('<a id="delBtnAMR" class="buttonAMR">Delete Bookmark</a>');
  btndel.click(deleteBookmarkButton);

  div
    .append(btndel)
    .append(btn);

  var divTip = $('<div id="tipBMAMR"></div>');

  divTip.append('<span>To bookmark a scan, right click on it and choose "Bookmark in AMR".</span><br /><span>To manage bookmarks, go to </span>');

  var aBMPage = $('<a href="#">AMR Bookmark Page</a>');

  aBMPage.click(function () {
    chrome.runtime.sendMessage({
      action: 'opentab',
      url: '/views/bookmarks.html'
    }, $.noop);
  });

  divTip.append(aBMPage);

  div.append(divTip);

  $(document.body).append(div);

  var mirrorScript = getMirrorScript();

  where
    .empty()
    .each(function (index) {
      var $this = $(this);
      var $select = $(select);
      var selectIns = $select
        .clone()
        .css('float', 'none')
        .css('max-width', $(document).width() - 450 + 'px')
        .attr('value', $select.children('option:selected').val())
        .change(function () {
          window.location.href = $('option:selected', $(this)).val();
        });

      var prevUrl = mirrorScript.previousChapterUrl(selectIns, document, window.location.href);
      var nextUrl = mirrorScript.nextChapterUrl(selectIns, document, window.location.href);

      if (prevUrl !== null) {
        $this.append('<a id="pChapBtn' + index + '" class="buttonAMR" href="' + prevUrl + '">Previous</a>');
      }

      $this.append(selectIns);

      if (nextUrl !== null) {
        $this.append('<a id="nChapBtn' + index + '" class="buttonAMR" href="' + nextUrl + '">Next</a>');

        $.data(document.body, 'nexturltoload', nextUrl);
      }

      // Add bookmark functionality
      var book = $('<img class="bookAMR" src="' + chrome.extension.getURL('../img/bookmark.png') + '"/>');

      book.on('click', function () {
        var $bookmarkData = $('#bookmarkData');
        var dataAccessor = $bookmarkData.data.bind($bookmarkData);

        dataAccessor('type', 'chapter');

        $('#noteAMR').val(dataAccessor('note'));

        $('#delBtnAMR')[dataAccessor('chapbooked') ? 'show' : 'hide']();

        $('#bookmarkPop').modal({
          focus: false,
          onShow: showDialog,
          zIndex: 10000000
        });
      });

      $this.append(book);

      if (index === 0) {
        var objBM = {
          action: 'getBookmarkNote',
          mirror: mirrorScript.mirrorName,
          url: res.currentMangaURL,
          chapUrl: res.currentChapterURL,
          type: 'chapter'
        };

        chrome.runtime.sendMessage(objBM, function (result) {
          var $bookmarkData = $('#bookmarkData');
          var $bookAMR = $('.bookAMR');

          if (!result.isBooked) {
            $bookmarkData.data('note', '');
            $bookAMR.attr('title', 'Click here to bookmark this chapter');
          }
          else {
            $bookmarkData.data('note', result.note);

            if (result.note !== '') {
              $bookAMR.attr('title', 'Note : ' + result.note);
            }

            $bookmarkData.data('chapbooked', true);
            $bookAMR.attr('src', IMAGE_PATH + 'bookmarkred.png');
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
        var imgread = $('<img class="butamrread" src="' + IMAGE_PATH + (!isRead ? 'read_stop.png' : 'read_play.png') + '" title="' + (!isRead ? 'Stop following updates for this manga' : 'Follow updates for this manga') + '" />');

        if (resp === null && params.addauto === 0) {
          imgread.hide();
        }

        $this.append(imgread);

        imgread
          .data('mangaurl', res.currentMangaURL)
          .on('click', function () {
            var $this = $(this);
            var curRead = ($this.attr('src') === IMAGE_PATH + 'read_play.png');
            var obj = {
              action: 'markReadTop',
              url: $this.data('mangaurl'),
              read: (curRead ? 0 : 1),
              updatesamemangas: true
            };

            sendExtRequest(obj, $this, function () {
              if (curRead) {
                $this
                  .attr('src', IMAGE_PATH + 'read_stop.png')
                  .attr('title', 'Stop following updates for this manga');
              }
              else {
                $this
                  .attr('src', IMAGE_PATH + 'read_play.png')
                  .attr('title', 'Follow updates for this manga');
              }
            }, false);
          });

        // Get specific mode for currentManga
        var curmode = (resp !== null && resp.display) ? resp.display : params.displayMode;

        // mode = 1 --> images are displayed on top of one another
        // mode = 2 --> images are displayed two by two occidental reading mode
        // mode = 3 --> images are displayed two by two japanese reading mode
        var imgmode = $('<img src="' + chrome.extension.getURL('../img/' + ((curmode === 1) ? 'ontop.png' : ((curmode === 2) ? 'righttoleft.png' : 'lefttoright.png'))) + '" title="' + ((curmode === 1) ? 'Scans displayed on top of each other (click to switch display mode for this manga only)' : ((curmode === 2) ? 'Scans displayed as a book in occidental mode (left to right) (click to switch display mode for this manga only)' : 'Scans displayed as a book in japanese mode (right to left) (click to switch display mode for this manga only)')) + '" />');

        $this.append(imgmode);

        imgmode
          .data({
            curmode: curmode,
            mangaurl: res.currentMangaURL
          })
          .on('click', function () {
            var $this = $(this);
            var curmode = $this.data('curmode');
            var mdnext = (curmode % 3) + 1;
            var obj = {
              action: 'setDisplayMode',
              url: $this.data('mangaurl'),
              display: mdnext
            };

            sendExtRequest(obj, $this, function () {
              var src;
              var title;

              $this.data('curmode', mdnext);

              transformImagesInBook(amrWhereScans, mdnext, $(document.body).data('amrparameters'));

              if (mdnext === 1) {
                src = IMAGE_PATH + 'ontop.png';
                title = 'Scans displayed on top of each other (click to switch display mode for this manga only)';
              }
              else if (mdnext === 2) {
                src = IMAGE_PATH + 'righttoleft.png';
                title = 'Scans displayed as a book in occidental mode (left to right) (click to switch display mode for this manga only)';
              }
              else {
                src = IMAGE_PATH + 'lefttoright.png';
                title = 'Scans displayed as a book in japanese mode (right to left) (click to switch display mode for this manga only)';
              }

              $this
                .attr('src', src)
                .attr('title', title);
            }, false);
          });

        var imgstop = $('<img class="butamrstop" src="' + IMAGE_PATH + 'stop.gif' + '" title="Mark this chapter as latest chapter read" />');

        if (resp === null && params.addauto === 0) {
          imgstop.hide();
        }

        $this.append(imgstop);

        imgstop
          .data('mangainfo', res)
          .on('click', function () {
            var $this = $(this);
            var ret = confirm('This action will reset your reading state for this manga and this chapter will be considered as the latest you have read. Do you confirm this action?');
            var obj;
            var data = $this.data();

            if (ret) {
              obj = {
                action: 'setMangaChapter',
                url: data.mangainfo.currentMangaURL,
                mirror: mirrorScript.mirrorName,
                lastChapterReadName: data.mangainfo.currentChapter,
                lastChapterReadURL: data.mangainfo.currentChapterURL,
                name: data.mangainfo.name
              };

              sendExtRequest(obj, $this, $.noop, true);
            }
          });

        if (params.addauto === 0 && resp === null) {
          var imgadd = $('<img src="' + chrome.extension.getURL('../img/add.png') + '" title="Add this manga to your reading list" />');

          $this.append(imgadd);

          imgadd
            .data('mangainfo', res)
            .on('click', function () {
              var $this = $(this);
              var data = $this.data();

              var obj = {
                action: 'readManga',
                url: data.mangainfo.currentMangaURL,
                mirror: mirrorScript.mirrorName,
                lastChapterReadName: data.mangainfo.currentChapter,
                lastChapterReadURL: data.mangainfo.currentChapterURL,
                name: data.mangainfo.name
              };

              sendExtRequest(obj, $this, function () {
                $('.butamrstop, .butamrread').show();
                $this.remove();
              }, true);
            });
        }

        $this.addClass('amrbarlayout');

        // TODO : change pub !!! (facebook + donate)...
        if (params.pub === 1) {
          var linkPub = $('<div class="titleAMRPub"></div>');
          var linkP2 = $('<span>You like reading your mangas this way with All Mangas Reader Extension, please donate !!&nbsp;&nbsp;</span><form action="https://www.paypal.com/cgi-bin/webscr" method="post" style="display:inline-block"><input type="hidden" name="cmd" value="_s-xclick"><input type="hidden" name="hosted_button_id" value="7GQN3EZ6KK5MU"><input type="image" src="https://www.paypalobjects.com/WEBSCR-640-20110429-1/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!"><img alt=" border="0" src="https://www.paypalobjects.com/WEBSCR-640-20110429-1/en_US/i/scr/pixel.gif" width="1" height="1"></form>');

          linkP2.css({
            'vertical-align': 'middle',
            color: 'red !important'
          });

          /*linkP2.click(function () {
            chrome.runtime.sendMessage({action: 'openExtensionMainPage'}, $.noop);

          });*/

          linkPub.append(linkP2);

          var deletePub = $('<img src="' + IMAGE_PATH + 'cancel.png' + '" />');

          deletePub
            .attr('title', 'Remove this banner...')
            .css({
              cursor: 'pointer',
              'vertical-align': 'middle',
              'margin-left': '10px'
            })
            .on('click', function () {
              chrome.runtime.sendMessage({
                action: 'deletepub'
              }, function () {
                $('.titleAMRPub').remove();
              });
            });

          linkPub.append(deletePub);

          $this.append(linkPub);
        }

        var whereNavToTrail = mirrorScript.whereDoIWriteNavigation(document, window.location.href);

        addTrailingLastChap($(whereNavToTrail).last());
      });
    });
}

var keyboardShortcuts = {
  // b
  66: function goToNextChapter () {
    var $nChapBtn0 = $('#nChapBtn0');

    if ($nChapBtn0.length > 0) {
      window.location.href = $nChapBtn0.attr('href');
    }
  },

  // n
  78: function goToPrevChapter () {
    var $pChapBtn0 = $('#pChapBtn0');

    if ($pChapBtn0.length > 0) {
      window.location.href = $pChapBtn0.attr('href');
    }
  },

  // s
  83: window.scrollBy.bind(window, 0, 40),

  // w
  87: window.scrollBy.bind(window, 0, -40),

  // +
  107: zoomIn,

  // -
  109: zoomOut
};

function runShortcut (which) {
  if (typeof keyboardShortcuts[which] === 'function') {
    keyboardShortcuts[which]();
  }
}

function bindHotkeys () {
  //  disable default websites shortcuts (mangafox)
  document.onkeypress = null;
  document.onkeydown = null;
  document.onkeyup = null;

  $(document)
    .unbind('keyup keydown keypress')
    .keyup(stopEventPropagation)
    .delegate('*', 'keyup', stopEventPropagation)
    .keydown(function (e) {
      var target = e.target || e.srcElement;
      var which = e.which;

      // Run shortcuts only if no input is focused
      if (!((target.type && target.type === 'text') || target.nodeName.toLowerCase() === 'textarea')) {
        runShortcut(which);

        if (useLeftRightKeys) {
          var doubleTap;
          var nb;
          var curimg;
          var viss;

          // Left key or A
          if (e.which in [37, 65]) {
            doubleTap = false;

            if (typeof lastpresstime !== 'undefined' && (new Date().getTime() - lastpresstime) < 500 && dirpress === 1) {
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
          if (e.which in [39, 68]) {
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
      $this.attr('src', chrome.extension.getURL('../img/imgerror.png'));

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

        var spanner = $this.parent();
        var $prev = $this.prev();
        var url = $prev.data('urlToLoad');
        var divLoadId = $prev.data('divLoad');
        var idScan = $prev.data('idScan');

        var img = new Image();
        var $img = $(img);

        $img
          .data('urlToLoad', url)
          .css('border', '5px solid white')
          .load(onLoadImage)
          .error(onErrorImage);

        getMirrorScript().getImageFromPageAndWrite(url, img, document, window.location.href);

        var div = $('<div id="' + divLoadId + '" class="divLoading"></div>');
        div.css('background', 'url(' + chrome.extension.getURL('../img/loading.gif') + ') no-repeat center center');

        $img.data({
          idScan: idScan,
          divLoad: divLoadId
        });

        spanner.empty();
        spanner.append($img);
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
      console.debug($(this).data('finish'));
      return $(this).data('finish') === 1;
    });

  return loaded.length;
}

function loadImageAMR (where, url, img, pos, res, mode, retry) {
  var mirrorScript = getMirrorScript();

  if (!retry) {
    $(img)
      .data({
        urlToLoad: url,
        resize: res.resize,
        modedisplay: mode
      })
      .load(onLoadImage)
      .error(onErrorImage);
  }

  if (res.imgorder === 1) {
    if (nbLoaded(where) === pos) {
      mirrorScript.getImageFromPageAndWrite(url, img, document, window.location.href);
    }
    else {
      setTimeout(loadImageAMR.bind(null, where, url, img, pos, res, mode, true), 100);
    }
  }
  else {
    mirrorScript.getImageFromPageAndWrite(url, img, document, window.location.href);
  }
}

function onLoadNextImage () {
  var self = this;

  $('[id^=nChapBtn]').each(function () {
    var $this = $(this);
    var nbloaded = $this.data('nbloaded');
    var prog = $this.find('.AMRprogress');

    $this.data('nbloaded', (nbloaded ? nbloaded : 0) + 1);

    if (prog.length === 0) {
      prog = $('<span class="buttonAMR AMRprogress></span>');
      prog.css({
        position: 'relative',
        top: '0',
        left: '0',
        width: '0px',
        height: '4px',
        'border-radius': '2px',
        'background-color': '#8888EE',
        opacity: '1',
        display: 'block'
      });

      $this.append(prog);
    }

    prog.css('width', (this.offsetWidth * (nbloaded / $(self).data('total'))) + 'px');
  });
}

function onErrorNextImage () {
  //  TODO retry...
}

function loadNextChapter (urlNext) {
  //  load an iframe with urlNext and get list of images
  var mirrorScript = getMirrorScript();

  chrome.runtime.sendMessage({
    action: 'getNextChapterImages',
    url: urlNext,
    mirrorName: mirrorScript.mirrorName
  }, function (resp) {
    var lst = resp.images;
    var img;

    if (lst !== null) {
      for (var i = 0; i < lst.length; i++) {
        img = new Image();

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

        mirrorScript.getImageFromPageAndWrite(lst[i], img, document, urlNext);
      }
    }
  });
}

var imageCheckerInterval;

function waitForImages (where, mode, res, title) {
  var isOk = true;
  var loadedImagesLength = 0;
  var images = $(where).find('.imageAMR');
  var total = images.length;

  images.each(function () {
    var data = $(this).data();

    if (data.finish === '1') {
      loadedImagesLength++;
    }
    else {
      isOk = false;
    }

    if (this.offsetWidth !== data.owidth) {
      $('#' + data.divLoad).hide();
    }
  });

  if (res.load === 1 && total !== 0) {
    document.title = Math.floor(loadedImagesLength / total * 100) + ' % - ' + title;
  }

  if (isOk) {
    transformImagesInBook(where, mode, res);
    getMirrorScript().doAfterMangaLoaded(document, window.location.href);

    document.title = title;

    var data = $.data(document.body);

    if (data.nexturltoload && prefetchChapter) {
      loadNextChapter(data.nexturltoload);
    }

    if (data.sendwhendownloaded) {
      chrome.runtime.sendMessage(data.sendwhendownloaded, $.noop);
    }

    clearTimeout(imageCheckerInterval);
  }
  else {
    imageCheckerInterval = setTimeout(waitForImages.bind(null, where, mode, res, title), 500);
  }
}

function writeImages (where, list, mode, res) {
  var table = $('<table class="AMRtable"></table>');

  table.css({
    'text-align': 'center',
    position: 'static',
    width: '100%'
  });

  list.forEach(function (item, i) {
    var tr = $('<tr></tr>');
    var td = $('<td></td>').css('text-align', 'center');

    var spanner = $('<div class="spanForImg"></div>')
      .css({
        'vertical-align': 'middle',
        'text-align': 'center'
      })
      .data('order', i);

    var div = $('<div id="loader' + i + '" class="divLoading"></div>').css('background', 'url(' + IMAGE_PATH + 'loading.gif' + ') no-repeat center center');

    var img = new Image();

    $(img)
      .addClass('imageAMR')
      .data({
        owidth: img.offsetWidth,
        divLoad: 'loader' + i,
        idScan: i
      });

    loadImageAMR(where, item, img, i, res, mode);

    table.append(tr);
    tr.append(td);
    td.append(spanner);
    spanner.append(div);
    spanner.append(img);
  });

  where.append(table);

  waitForImages(where, mode, res, document.title);
}

function initPage () {
  var mirrorScript = getMirrorScript();

  if (mirrorScript.isCurrentPageAChapterPage(document, window.location.href)) {
    console.info('-> Binding shortcuts');
    bindHotkeys();

    console.info('-> Getting settings');
    chrome.runtime.sendMessage({
      action: 'parameters'
    }, function (response) {
      console.info('-> Got settings');

      useLeftRightKeys = response.lrkeys === 1;
      autoBookmarkScans = response.autobm === 1;
      prefetchChapter = response.prefetch === 1;
      nextRight = response.rightnext === 1;
      sendStats = response.sendstats === 1;

      var $body = $(document.body);

      mirrorScript.getInformationsFromCurrentPage(document, window.location.href, function (currentManga) {
        $body.data('curpageinformations', currentManga);

        chrome.runtime.sendMessage({
          action: 'mangaInfos',
          url: currentManga.currentMangaURL
        }, function (resp) {
          chrome.runtime.sendMessage({
            action: 'barState'
          }, function (barState) {
            createDataDiv(currentManga);
            var imagesUrl = mirrorScript.getListImages(document, window.location.href);
            var select = mirrorScript.getMangaSelectFromPage(document, window.location.href);
            var isSel = true;
            var whereNav;

            if (select === null) {
              var selectIns = $('<select></select>').data('mangaCurUrl', currentManga.currentChapterURL);
              mirrorScript.getListChaps(currentManga.currentMangaURL, currentManga.name, selectIns, callbackListChaps);
              isSel = false;
            }

            mirrorScript.doSomethingBeforeWritingScans(document, window.location.href);

            if (isSel) {
              whereNav = response.newbar === 1 ? createBar(barState.barVis) : mirrorScript.whereDoIWriteNavigation(document, window.location.href);

              writeNavigation(whereNav, select, currentManga, response);
            }

            var where = mirrorScript.whereDoIWriteScans(document, window.location.href);

            amrWhereScans = where;

            $body.data('amrparameters', response);

            //  Get specific mode for currentManga
            var curmode = -1;
            if (resp !== null && resp.display) {
              curmode = resp.display;
            }

            //  If not use currentManga.mode
            if (curmode === -1) {
              curmode = response.displayMode;
            }

            writeImages(where, imagesUrl, curmode, response);
          });

          debugger;

          var payload = {
            action: 'readManga',
            url: currentManga.currentMangaURL,
            mirror: mirrorScript.mirrorName,
            lastChapterReadName: currentManga.currentChapter,
            lastChapterReadURL: currentManga.currentChapterURL,
            name: currentManga.name
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
              url: currentManga.currentMangaURL,
              mirror: mirrorScript.mirrorName,
              lastChapterReadName: currentManga.currentChapter,
              lastChapterReadURL: currentManga.currentChapterURL,
              name: currentManga.name
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
