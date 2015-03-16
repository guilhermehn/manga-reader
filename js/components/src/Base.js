// Components global namespace
window.Components = {};

window._ = {
  copy (source, object, props) {
    if (!props) {
      props = object;
      object = {};
    }
    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];
      object[key] = source[key];
    }
    return object;
  },

  assign (object, source, customizer) {
    var props = Object.keys(source);
    if (!customizer) {
      return this.copy(source, object, props);
    }

    var index = -1;
    var length = props.length;

    while (++index < length) {
      var key = props[index];
      var value = object[key];
      var result = customizer(value, source[key], key, object, source);

      if ((result === result ? (result !== value) : (value === value)) || (typeof value === 'undefined' && !(key in object))) {
        object[key] = result;
      }
    }
    return object;
  }
};
