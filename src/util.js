// similar to jquery.fn.offset
export const nodeOffset = function(el) {
  var rect, win;
  if (!el) {
    return;
  }
  if (!el.getClientRects().length) {
    return { top: 0, left: 0 };
  }
  rect = el.getBoundingClientRect();
  win = el.ownerDocument.defaultView;
  return {
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset    
  };
};

export const on = (function() {
  if (document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    }
  } else {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler);
      }
    }
  }
})();

const getValueByPath = function(object, prop) {
  prop = prop || '';
  const paths = prop.split('.');
  let current = object;
  let result = null;
  for (let i = 0, j = paths.length; i < j; i++) {
    const path = paths[i];
    if (!current) break;

    if (i === j - 1) {
      result = current[path];
      break;
    }
    current = current[path];
  }
  return result;
};

const isObject = function(obj) {
  return obj !== null && typeof obj === 'object';
};

export const orderBy = function(array, sortKey, reverse, sortMethod, sortBy) {
  if (!sortKey && !sortMethod && (!sortBy || Array.isArray(sortBy) && !sortBy.length)) {
    return array;
  }
  if (typeof reverse === 'string') {
    reverse = reverse === 'descending' ? -1 : 1;
  } else {
    reverse = (reverse && reverse < 0) ? -1 : 1;
  }
  const getKey = sortMethod ? null : function(value, index) {
    if (sortBy) {
      if (!Array.isArray(sortBy)) {
        sortBy = [sortBy];
      }
      return sortBy.map(function(by) {
        if (typeof by === 'string') {
          return getValueByPath(value, by);
        } else {
          return by(value, index, array);
        }
      });
    }
    if (sortKey !== '$key') {
      if (isObject(value) && '$value' in value) value = value.$value;
    }
    return [isObject(value) ? getValueByPath(value, sortKey) : value];
  };
  const compare = function(a, b) {
    if (sortMethod) {
      return sortMethod(a.value, b.value);
    }
    for (let i = 0, len = a.key.length; i < len; i++) {
      if (a.key[i] < b.key[i]) {
        return -1;
      }
      if (a.key[i] > b.key[i]) {
        return 1;
      }
    }
    return 0;
  };
  return array.map(function(value, index) {
    return {
      value: value,
      index: index,
      key: getKey ? getKey(value, index) : null
    };
  }).sort(function(a, b) {
    let order = compare(a, b);
    if (!order) {
      // make stable https://en.wikipedia.org/wiki/Sorting_algorithm#Stability
      order = a.index - b.index;
    }
    return order * reverse;
  }).map(item => item.value);
};
