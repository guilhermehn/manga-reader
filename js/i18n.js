/*
Translation function based on AdBlock+
Google chrome extension under GNU GLP v3
licence
 */
function translate (messageID, args) {
  return chrome.i18n.getMessage(messageID, args);
}
function localizePage () {
  // translate a page into the users language
  $('[i18n]:not(.i18n-replaced)').each(function () {
    var $this = $(this);
    var i18n = $this.attr('i18n');
    var i18nArgs = $this.attr('i18n_args');
    var translateArgs = [i18n];

    if (i18nArgs) {
      translateArgs.push(JSON.parse(i18nArgs));
    }

    $this.html(translate.apply(null, translateArgs));
  });

  $('[i18n_value]:not(.i18n-replaced)').each(function () {
    $(this).val(translate($(this).attr('i18n_value')));
  });

  $('[i18n_title]:not(.i18n-replaced)').each(function () {
    $(this).attr('title', translate($(this).attr('i18n_title')));
  });

  $('[i18n_placeholder]:not(.i18n-replaced)').each(function () {
    $(this).attr('placeholder', translate($(this).attr('i18n_placeholder')));
  });

  $('[i18n_replacement_el]:not(.i18n-replaced)').each(function () {
    // Replace a dummy <a/> inside of localized text with a real element.
    // Give the real element the same text as the dummy link.
    var $this = $(this);
    var dummyLink = $this.find('a');
    var text = dummyLink.text();
    var realEl = $('#' + $this.attr('i18n_replacement_el'));

    realEl.text(text).val(text).replaceAll(dummyLink);
    // If localizePage is run again, don't let the [i18n] code above
    // clobber our work
    $this.addClass('i18n-replaced');
  });
}

$(function () {
  localizePage();
});
