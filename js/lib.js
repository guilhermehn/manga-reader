/*globals mirrors*/

function getMangaMirror (mirror) {
  var i = -1;

  while (++i < mirrors.length) {
    if (mirrors[i].mirrorName === mirror) {
      return mirrors[i];
    }
  }

  return null;
}
