let $ = require('jquery');

let parserUtils = {
  getPage(url, done) {
    $.ajax({
      url : url,
      beforeSend(xhr) {
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.setRequestHeader('Pragma', 'no-cache');
      },
      success(response) {
        done($(response), response);
      }
    });
  }
};

module.exports = parserUtils;
