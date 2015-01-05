/*globals Notification, openTab*/

window.addEventListener('load', function () {
  var button = document.getElementsByClassName('notification')[0];

  button.addEventListener('click', function () {
    // If the user agreed to get notified
    // Let's try to send ten notifications
    if (Notification && Notification.permission === 'granted') {
      for (var i = 0; i < 10; i++) {
        // Thanks to the tag, we should only see the 'Hi! 9' notification
        var n = new Notification('Hi! ' + i, {
          tag: 'soManyNotification'
        });
      }
    }
  });
});

window.addEventListener('load', function () {
  var button2 = document.getElementsByTagName('button')[1];
  button2.addEventListener('click', function () {
    /*obj = {
      type: 'basic',
      iconUrl: chrome.extension.getURL('img/icon-32.png'),
      title: 'test',
      message: 'button pressed',
      buttons: [{title: 'read'}]
    };
    chrome.notifications.create('', obj, function (id) {
      console.log(id)
    });*/
    showNotification('Something', 'http://batoto.net/');
  });
});

function getMirrorNamefromURL (url) {
  var mirrors = chrome.extension.getBackgroundPage().mirrors;
  var i = -1;
  var length = mirrors.length;

  while (++i < length) {
    if (mirrors[i].isMe(url)) {
      console.log('found');
      return mirrors[i].mirrorName;
    }
  }
  return false;
}

function notificationmessage (url) {
  if (!getMirrorNamefromURL(url)) {
    return 'We got an error while fetching the URL';
  }
  else {
    return 'Start reading from ' + getMirrorNamefromURL(url);
  }
}

function prepareNotifobj (title, url) {
  var obj = {
    type : 'basic',
    iconUrl: chrome.extension.getURL('img/icon-32.png'),
    title: 'We got updates of ' + title,
    message: notificationmessage(url)
  };

  return obj;
}

function createnotification(obj, url) {
  chrome.notifications.onClicked.addListener(function (id) {
    openTab(url);
    this.clear(id, function (){});
  });

  chrome.notifications.create('', obj, function (id) {
    //console.log(id);
  });

  //console.log(iden);
}

function showNotification(title, url) {
  var obj = prepareNotifobj(title, url);
  var iden = createnotification(obj, url);
  //console.log(iden);
  /*chrome.notifications.clear(iden, function (bool) {
    console.log(bool);
  });*/
}
