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
  });
}

$(function () {
  $('.importamrhead').show();
  $('.importamr').show();
  $('.labamr').show();
  $('<img class=\'importimplemamr\' width=\'16\' src=\'' + chrome.extension.getURL('../img/amrlittle.png') + '\' title=\'Import this implementation in your AMR\' />').appendTo($('.importamr'));
  $('<img class=\'labimplemamr\' src=\'' + chrome.extension.getURL('../img/dev.png') + '\' title=\'Import this implementation in your AMR and view it in the lab\' />').appendTo($('.labamr'));

  $('.importamr').click(function () {
    if ($(this).hasClass('disabled')) {
      alert('You have changed parts of the code... You must update the implementation before importing it.');
    }
    else {
      var $this = $(this);
      var id = $this.is('.button') ? $('input[name=\'wid\']').val() : $this.closest('tr').attr('rel');

      var req = {
        action: 'importimplementation',
        id: id
      };

      sendExtRequest(req, $this.is('.button') ? $this : $('.importimplemamr', $this), function () {}, true);
    }
  });

  $('.labamr').click(function () {
    if ($(this).hasClass('disabled')) {
      alert('You have changed parts of the code... You must update the implementation before importing it.');
    }
    else {
      var $this = $(this);
      var id = $this.is('.button') ? $('input[name=\'wid\']').val() : $this.closest('tr').attr('rel');

      var req = {
        action: 'importimplementation',
        id: id
      };

      sendExtRequest(req, $this.is('.button') ? $this : $('.labimplemamr', $this), function (response) {
        chrome.runtime.sendMessage({
          action: 'opentab',
          url: chrome.extension.getURL('lab.html?mirror=' + response.mirror)
        }, function () {});
      }, true);
    }
  });
});
