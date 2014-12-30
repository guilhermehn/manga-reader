/*globals loadMenu*/
var IMAGE_PATH = chrome.extension.getURL('img/');

function switchOnglet (ong, tab) {
  $('.tab').removeClass('checked');
  $(ong).addClass('checked');

  $('.ongletCont').each(function () {
    var $this = $(this);
    $this[$this.attr('id') === tab ? 'show' : 'hide']();
  });
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
  var imgSrc;
  if (button.is('img')) {
    ancSrc = button.attr('src');
    button.attr('src', IMAGE_PATH + 'load16.gif');
  }
  else {
    if (button.is('.button')) {
      imgSrc = IMAGE_PATH + 'ltload.gif';
    }
    if (button.is('.category') || button.is('.mgcategory')) {
      imgSrc = IMAGE_PATH + 'load10.gif';
    }

    ancSrc = $('<img src=\'' + imgSrc + '\'></img>');
    ancSrc.appendTo(button);
  }
  // Call the action
  setTimeout(function () {
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
  }, 10);
}

function exportData () {
  var expMgs = $('#mgCk').prop('checked');
  var expBms = $('#bmCk').prop('checked');
    // The getJSONListToSync rise an error in JSLint, because it thinks
    // is a synchronous call. The name of the function needs to be changed
    // if we want get rid of the message.
  var mgs = chrome.extension.getBackgroundPage().getJSONListToSync();
  var res = {};
  /*chrome.tabs.create({url: 'export.html?mg=' + expMgs + '&bm=' + expBms}, function(tab) {
  });*/
  if (expMgs) {
    res.mangas = mgs;
  }

  if (expBms) {
    res.bookmarks = JSON.stringify(chrome.extension.getBackgroundPage().bookmarks || []);
  }

  $('#exportBox').html(JSON.stringify(res));
  $('#resExp').show();
}

function CopyToClipboard () {
  chrome.extension.getBackgroundPage().setclipboard($('#exportBox').text());
  // TODO: We should create a single message box instead using alert.
  alert('Data have been saved to clipboard.');
}

var data;

function importManga (but, mergeVal) {
  var obj = {
    action : 'importMangas',
    mangas : JSON.parse(data.mangas),
    merge : mergeVal
  };

  sendExtRequest(obj, $(but), function (resp) {
    $('#resultBout').remove();
    $('<center><textarea id=\'resultBout\' cols=\'90\' rows=\'10\' ></textarea></center>').appendTo($('#resImp'));
    $('#resultBout').val(resp.out);
  }, true);
}

function importBookmark (but, mergeVal) {
  var obj = {
    action : 'importBookmarks',
    bookmarks : JSON.parse(data.bookmarks),
    merge : mergeVal
  };

  sendExtRequest(obj, $(but), function (resp) {
    $('#resultBout').remove();
    $('<center><textarea id=\'resultBout\' cols=\'90\' rows=\'10\' ></textarea></center>').appendTo($('#resImp'));
    $('#resultBout').val(resp.out);
  }, true);
}

function importData () {
  var resImp = $('#resImp');
  resImp.hide();

  try {
    data = JSON.parse($('#importBox').val());
  }
  catch (e) {
    // TODO: We should create a single message box instead using alert.
    alert('Error while parsing data in the hereinabove box...');
    return;
  }

  // TODO: We should check for all implementation scripts be loaded before trying to parse the input.
  console.log(data);
  resImp.empty();

  if (data.mangas) {
    $('<div class=\'resImpDiv\'><span class=\'resImport\'>' + JSON.parse(data.mangas).length + ' mangas found.</span><div class=\'button\' id=\'btnMangaMerge\'>Import manga list (merge)</div><div class=\'button\' id=\'btnMangaErase\'>Import manga list (erase)</div></div>').appendTo(resImp);

    var importActualMangas = importManga.bind(null, this);
    $('#btnMangaMerge').on('click', importActualMangas.bind(null, true));
    $('#btnMangaErase').on('click', importActualMangas.bind(null, false));
  }

  if (data.bookmarks) {
    $('<div class=\'resImpDiv\'><span class=\'resImport\'>' + JSON.parse(data.bookmarks).length + ' bookmarks found.</span><div class=\'button\' id=\'btnBookMerge\'>Import bookmark list (merge)</div><div class=\'button\' id=\'btnBookErase\'>Import bookmark list (erase)</div></div>').appendTo(resImp);
    $('#btnBookMerge').on('click', function () {
      importBookmark(this, true);
    });

    $('#btnBookErase').on('click', function () {
      importBookmark(this, false);
    });
  }

  resImp.show();
}

function downloadExportFile () {
  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth() + 1;
  var day = today.getDate();

  // pad day and month with 0s as necessary
  month = ('0' + month).slice(-2);
  day = ('0' + day).slice(-2);

  // set the download attribute
  this.download = [year, month, day].join('-') + '.txt';

  // set the href with the base64 encoded data
  this.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent($('#exportBox').val());
}

$(function () {
  loadMenu('impexp');
  $('.article').show();
  $('.ongletCont[id!=\'ong1\']').hide();

  $('.tabs li').on('click', function () {
    var ong = ($(this).text() === 'Import') ? 'ong1' : 'ong2';
    switchOnglet(this, ong);
  });

  $('#importdata').on('click', importData);
  $('#exportdata').on('click', exportData);
  $('#copytoclip').on('click', CopyToClipboard);
  $('#downloadtxt').on('click', downloadExportFile);
});
