function getMirrorsUsage (mirrors, mangas) {
  mangas.forEach(function (manga) {
    for (var i = 0; i < mirrors.length; i += 1) {
      if (mirrors[i].mirrorName === manga.mirror) {
        if (mirrors[i].nb) {
          mirrors[i].nb += 1;
        }
        else {
          mirrors[i].nb = 1;
        }

        break;
      }
    }
  });
}

/**
 * Contains utils function...
 */
var MgUtil = {
  /**
   * Sort mirrors list according to user's most used mirrors
   */
  sortMirrors: function (mirrors, mangas) {
    if (typeof mangas !== 'undefined') {
      mangas.forEach(mangas, function (manga) {
        for (var i = 0; i < mirrors.length; i += 1) {
          if (mirrors[i].mirrorName === manga.mirror) {
            if (mirrors[i].nb) {
              mirrors[i].nb += 1;
            }
            else {
              mirrors[i].nb = 1;
            }

            break;
          }
        }
      });
    }

    mirrors.sort(function (a, b) {
      var aUndefined = typeof a.nb === 'undefined';
      var bUndefined = typeof b.nb === 'undefined';

      if (aUndefined && bUndefined) {
        return ((a.mirrorName < b.mirrorName) ? -1 : 1);
      }
      else if (aUndefined) {
        return 1;
      }
      else if (bUndefined) {
        return -1;
      }

      return (a.nb < b.nb) ? 1 : ((a.nb === b.nb) ? ((a.mirrorName < b.mirrorName) ? -1 : 1) : -1);
    });

    return mirrors;
  },

  /**
   * Sort mirrors list according to user's most used mirrors
   */
  getUsedMirrors: function (mirrors, mangas) {
    if (typeof mangas === 'undefined' || typeof mirrors === 'undefined') {
      return [];
    }

    var mirrorsUsage = {};

    mangas.forEach(function (manga) {
      mirrorsUsage[manga.mirror] = 1;
    });

    return Object.keys(mirrorsUsage);
  },

  /**
   * Returns a select containing AMR's supported languages (scans languages)
   */
  getLanguageSelect : function (mirrors) {
    var lst = MgUtil.getLanguageList(mirrors);
    lst.sort(function (a, b) {
      return (a.language < b.language) ? -1 : 1;
    });

    var sel = $('<select><option value=\'all\' selected=\'true\'>All languages</option></select>');

    lst.forEach(function (value) {
      $('<option value=\'' + value.code + '\'>' + value.language + '</option>').appendTo(sel);
    });

    return sel;
  },

  /**
   * Returns AMR's supported languages list (scans languages)
   */
  getLanguageList : function (mirrors) {
    var langs = [];

    if (typeof mirrors !== 'undefined') {
      mirrors.forEach(function (mirror) {
        var l = mirror.languages ? mirror.languages.split(',') : [];

        l.forEach(function (lang) {
          var isFound = false;
          var i;

          for (i = 0; i < langs.length; i += 1) {
            if (langs[i].code === lang) {
              isFound = true;
            }
          }

          if (!isFound) {
            langs[langs.length] = {
              code: lang,
              language: MgUtil.getLanguageName(lang)
            };
          }
        });
      });
    }
    return langs;
  },

  /**
   * Returns the name of a language from its code
   */
  getLanguageName : function (code) {
    var lang;

    if (typeof MgUtil.languages !== 'undefined') {
      MgUtil.languages.forEach(function (index, value) {
        if (code === value.code) {
          lang = value.language;
        }
      });
    }

    return lang;
  },

  /**
   * Returns list of web site in the language
   */
  getMirrorsFromLocale : function (mirrors, langCode) {
    var res = [];

    mirrors.forEach(function (value) {
      var l = value.languages ? value.languages.split(',') : [];

      l.forEach(function (lang) {
        if (langCode === lang) {
          res[res.length] = value.mirrorName;
        }
      });
    });

    return res;
  },

  /**
   * List of languages
   */
  languages : [
    {
      code: 'af',
      language: 'Afrikaans'
    },
    {
      code: 'sq',
      language: 'Albanian'
    },
    {
      code: 'ar',
      language: 'Arabic'
    },
    {
      code: 'be',
      language: 'Belarusian'
    },
    {
      code: 'bg',
      language: 'Bulgarian'
    },
    {
      code: 'ca',
      language: 'Catalan'
    },
    {
      code: 'zh',
      language: 'Chinese'
    },
    {
      code: 'zh-CN',
      language: 'Chinese Simplified'
    },
    {
      code: 'zh-TW',
      language: 'Chinese Traditional'
    },
    {
      code: 'hr',
      language: 'Croatian'
    },
    {
      code: 'cs',
      language: 'Czech'
    },
    {
      code: 'da',
      language: 'Danish'
    },
    {
      code: 'nl',
      language: 'Dutch'
    },
    {
      code: 'en',
      language: 'English'
    },
    {
      code: 'et',
      language: 'Estonian'
    },
    {
      code: 'tl',
      language: 'Filipino'
    },
    {
      code: 'fi',
      language: 'Finnish'
    },
    {
      code: 'fr',
      language: 'French'
    },
    {
      code: 'gl',
      language: 'Galician'
    },
    {
      code: 'de',
      language: 'German'
    },
    {
      code: 'el',
      language: 'Greek'
    },
    {
      code: 'ht',
      language: 'Haitian Creole'
    },
    {
      code: 'iw',
      language: 'Hebrew'
    },
    {
      code: 'hi',
      language: 'Hindi'
    },
    {
      code: 'hu',
      language: 'Hungarian'
    },
    {
      code: 'is',
      language: 'Icelandic'
    },
    {
      code: 'id',
      language: 'Indonesian'
    },
    {
      code: 'ga',
      language: 'Irish'
    },
    {
      code: 'it',
      language: 'Italian'
    },
    {
      code: 'ja',
      language: 'Japanese'
    },
    {
      code: 'lv',
      language: 'Latvian'
    },
    {
      code: 'lt',
      language: 'Lithuanian'
    },
    {
      code: 'mk',
      language: 'Macedonian'
    },
    {
      code: 'ms',
      language: 'Malay'
    },
    {
      code: 'mt',
      language: 'Maltese'
    },
    {
      code: 'no',
      language: 'Norwegian'
    },
    {
      code: 'fa',
      language: 'Persian'
    },
    {
      code: 'pl',
      language: 'Polish'
    },
    {
      code: 'pt',
      language: 'Portuguese'
    },
    {
      code: 'ro',
      language: 'Romanian'
    },
    {
      code: 'ru',
      language: 'Russian'
    },
    {
      code: 'sr',
      language: 'Serbian'
    },
    {
      code: 'sk',
      language: 'Slovak'
    },
    {
      code: 'sl',
      language: 'Slovenian'
    },
    {
      code: 'es',
      language: 'Spanish'
    },
    {
      code: 'sw',
      language: 'Swahili'
    },
    {
      code: 'sv',
      language: 'Swedish'
    },
    {
      code: 'th',
      language: 'Thai'
    },
    {
      code: 'tr',
      language: 'Turkish'
    },
    {
      code: 'uk',
      language: 'Ukrainian'
    },
    {
      code: 'vi',
      language: 'Vietnamese'
    },
    {
      code: 'cy',
      language: 'Welsh'
    },
    {
      code: 'yi',
      language: 'Yiddish'
    }
  ]
};
