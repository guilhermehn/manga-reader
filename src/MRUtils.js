'use strict';

let MRUtils = {
  __uniqueIdSet: {},

  uniqueId () {
    let idsCount = Object.keys(this.__uniqueIdSet).length.toString();
    this.__uniqueIdSet[idsCount] = Symbol();
    return idsCount;
  },

  slice (object) {
    return [].slice.call(object);
  }
};

module.exports = MRUtils;
