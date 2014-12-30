/*globals removeBanner, initPage*/
(function () {
  chrome.runtime.sendMessage({
    action: 'pagematchurls',
    url: window.location.href
  }, function (response) {
    if (response.isOk) {
      removeBanner();
      initPage();
    }
  });
})();
