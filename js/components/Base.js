// Components global namespace
window.Components = {};

let __uniqueIdSet = {};

window._ = {
  uniqueId () {
    let idsCount = Object.keys(__uniqueIdSet).length.toString();
    __uniqueIdSet[idsCount] = Symbol();
    return idsCount;
  },

  slice (object) {
    return [].slice.call(object);
  }
};
