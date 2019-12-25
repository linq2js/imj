"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = imj;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CloneMode = {
  None: 0,
  Unknown: 1,
  Object: 2,
  Array: 3
};

var defaultSelector = function defaultSelector(x) {
  return x;
};

function arrayEqual(arr1, arr2) {
  if (arr1 === arr2) return true;
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
  if (!Array.isArray(arr1) || Array.isArray(arr2)) return false;
  return arr1.every(function (item, index) {
    return arr2[index] === item;
  });
}

var Modifier =
/*#__PURE__*/
function () {
  function Modifier(value, args) {
    var _this = this;

    _classCallCheck(this, Modifier);

    this.original = value;
    this.value = value;
    Object.assign(this, args, {
      result: function result() {
        return _this.__result;
      }
    });
  }

  _createClass(Modifier, [{
    key: "__arrayProxy",
    value: function __arrayProxy(method, clone) {
      var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var modifiedArray;
      return this.mutate(CloneMode.None, function (original) {
        var _ref;

        if (typeof original === "undefined" || original === null) {
          original = [];
        }

        modifiedArray = (_ref = clone ? original.slice(0) : original)[method].apply(_ref, _toConsumableArray(args));
        return modifiedArray.length !== original.length || modifiedArray.some(function (item, index) {
          return item !== original[index];
        });
      }, function () {
        return modifiedArray;
      });
    }
  }, {
    key: "orderBy",
    get: function get() {
      var _this2 = this;

      return this.__orderBy || (this.__orderBy = function (selector) {
        return _this2.sort(function (a, b) {
          var aValue = selector(a);
          var bValue = selector(b);

          if (aValue > bValue) {
            return 1;
          }

          return aValue === bValue ? 0 : -1;
        });
      });
    }
  }, {
    key: "reverse",
    get: function get() {
      var _this3 = this;

      return this.__reverse || (this.__reverse = function () {
        return _this3.__arrayProxy("reverse", true);
      });
    }
  }, {
    key: "sort",
    get: function get() {
      var _this4 = this;

      return this.__sort || (this.__sort = function (comparer) {
        return _this4.__arrayProxy("sort", true, [comparer]);
      });
    }
  }, {
    key: "filter",
    get: function get() {
      var _this5 = this;

      return this.__filter || (this.__filter = function (predicate) {
        return _this5.__arrayProxy("filter", false, [predicate]);
      });
    }
  }, {
    key: "slice",
    get: function get() {
      var _this6 = this;

      return this.__slice || (this.__slice = function (from, to) {
        return _this6.__arrayProxy("slice", false, [from, to]);
      });
    }
  }, {
    key: "shift",
    get: function get() {
      var _this7 = this;

      return this.__shift || (this.__shift = function () {
        return _this7.mutate(CloneMode.Array, function (prev) {
          return prev && prev.length;
        }, function (next) {
          return next.shift();
        });
      });
    }
  }, {
    key: "remove",
    get: function get() {
      var _this8 = this;

      return this.__remove || (this.__remove = function () {
        for (var _len = arguments.length, keys = new Array(_len), _key = 0; _key < _len; _key++) {
          keys[_key] = arguments[_key];
        }

        keys = keys.map(tryExtractPropNameFromAccessor);
        return _this8.mutate(CloneMode.Unknown, function (prev) {
          return prev && (prev instanceof Set || prev instanceof Map ? keys.some(function (key) {
            return prev.has(key);
          }) : keys.some(function (key) {
            return key in prev;
          }));
        }, function (next) {
          if (Array.isArray(next)) {
            var sortedKeys = keys.sort();

            while (sortedKeys.length) {
              next.splice(sortedKeys.pop(), 1);
            }
          } else if (next instanceof Map || next instanceof Set) {
            keys.forEach(function (key) {
              return next["delete"](key);
            });
          } else {
            keys.forEach(function (key) {
              return delete next[key];
            });
          }
        });
      });
    }
  }, {
    key: "pop",
    get: function get() {
      var _this9 = this;

      return this.__pop || (this.__pop = function () {
        return _this9.mutate(CloneMode.Array, function (prev) {
          return prev && prev.length;
        }, function (next) {
          return next.pop();
        });
      });
    }
  }, {
    key: "keep",
    get: function get() {
      var _this10 = this;

      return this.__keep || (this.__keep = function () {
        for (var _len2 = arguments.length, keys = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          keys[_key2] = arguments[_key2];
        }

        keys = keys.map(tryExtractPropNameFromAccessor);
        return _this10.mutate(CloneMode.Unknown, function () {
          return true;
        }, function (prev) {
          return prev;
        }, function (next) {
          if (next instanceof Map) {
            return keys.reduce(function (map, key) {
              map.set(key, next.get(key));
              return map;
            }, new Map());
          }

          if (Array.isArray(next)) {
            return keys.map(function (key) {
              return next[key];
            });
          }

          if (typeof next === "undefined" || next === null) {
            return {};
          }

          return keys.reduce(function (obj, key) {
            obj[key] = next[key];
            return obj;
          }, {});
        });
      });
    }
  }, {
    key: "unshift",
    get: function get() {
      var _this11 = this;

      return this.__unshift || (this.__unshift = function () {
        for (var _len3 = arguments.length, values = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          values[_key3] = arguments[_key3];
        }

        return _this11.mutate(CloneMode.None, function () {
          return !!values.length;
        }, function (next) {
          return values.concat(next || []);
        });
      });
    }
  }, {
    key: "splice",
    get: function get() {
      var _this12 = this;

      return this.__splice || (this.__splice = function (index, count) {
        for (var _len4 = arguments.length, newItems = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
          newItems[_key4 - 2] = arguments[_key4];
        }

        return _this12.mutate(CloneMode.Array, function (prev) {
          return prev && (count && prev.length > index || newItems.length);
        }, function (next) {
          return next.splice.apply(next, [index, count].concat(newItems));
        });
      });
    }
  }, {
    key: "unset",
    get: function get() {
      var _this13 = this;

      return this.__unset || (this.__unset = function () {
        for (var _len5 = arguments.length, props = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          props[_key5] = arguments[_key5];
        }

        props = props.map(tryExtractPropNameFromAccessor);
        return _this13.mutate(CloneMode.Unknown, function (prev) {
          return prev && props.some(function (prop) {
            return prop in prev;
          });
        }, function (next) {
          return props.forEach(function (prop) {
            return delete next[prop];
          });
        });
      });
    }
  }, {
    key: "mutate",
    get: function get() {
      var _this14 = this;

      return this.__mutate || (this.__mutate = function (cloneMode, checker, modifier) {
        var selector = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : defaultSelector;
        var value = _this14.value; // do nothing

        if (!checker(value)) {
          return _this14;
        }

        if (cloneMode && value === _this14.original) {
          if (typeof value === "undefined" || value === null) {
            value = cloneMode === CloneMode.Array ? [] : {};
          } else if (Array.isArray(value)) {
            value = selector(value).slice(0);
          } else if (value instanceof Date) {
            value = new Date(value.getTime());
          } else if (value instanceof Set) {
            value = new Set(selector(value));
          } else if (value instanceof Map) {
            value = new Map(selector(value));
          } else if (_typeof(value) === "object") {
            value = Object.assign({}, selector(value));
          }
        }

        var next = modifier(value);

        if (cloneMode) {
          _this14.value = value;
          _this14.__result = next;
        } else {
          _this14.value = next;
        }

        return _this14;
      });
    }
  }, {
    key: "push",
    get: function get() {
      var _this15 = this;

      return this.__push || (this.__push = function () {
        for (var _len6 = arguments.length, values = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
          values[_key6] = arguments[_key6];
        }

        return _this15.mutate(CloneMode.None, function () {
          return values.length;
        }, function (next) {
          return [].concat(next || []).concat(values);
        });
      });
    }
  }, {
    key: "assign",
    get: function get() {
      var _this16 = this;

      return this.__assign || (this.__assign = function () {
        for (var _len7 = arguments.length, newProps = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
          newProps[_key7] = arguments[_key7];
        }

        var finalProps = Object.assign.apply(Object, [{}].concat(newProps));
        return _this16.mutate(CloneMode.Object, function (prev) {
          return !prev || Object.keys(finalProps).some(function (key) {
            return finalProps[key] !== prev[key];
          });
        }, function (next) {
          return Object.assign(next, finalProps);
        });
      });
    }
  }, {
    key: "map",
    get: function get() {
      var _this17 = this;

      return this.__map || (this.__map = function (mapper) {
        var clonedValue;
        return _this17.mutate(CloneMode.None, function (prev) {
          if (!prev) return true;
          clonedValue = prev.map(mapper);
          return !arrayEqual(clonedValue, prev);
        }, function () {
          return clonedValue;
        });
      });
    }
  }, {
    key: "swap",
    get: function get() {
      var _this18 = this;

      return this.__swap || (this.__swap = function (prop1, prop2) {
        return _this18.mutate(CloneMode.Unknown, function (prev) {
          return !prev || prev[prop1] !== prev[prop2];
        }, function (next) {
          var temp = next[prop1];
          next[prop1] = next[prop2];
          next[prop2] = temp;
        });
      });
    }
  }, {
    key: "current",
    get: function get() {
      var _this19 = this;

      return this.__current || (this.__current = function () {
        return _this19.value;
      });
    }
  }, {
    key: "toggle",
    get: function get() {
      var _this20 = this;

      return this.__toggle || (this.__toggle = function () {
        _this20.value = !_this20.value;
        return _this20;
      });
    }
  }, {
    key: "add",
    get: function get() {
      var _this21 = this;

      return this.__add || (this.__add = function () {
        var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

        if (_this21.value instanceof Date || typeof _this21.value === "string" && typeof value !== "string") {
          var d = new Date(_this21.value);
          _this21.value = new Date(d.getFullYear() + (value.years || 0), d.getMonth() + (value.months || 0), d.getDate() + (value.days || 0), d.getHours() + (value.hours || 0), d.getMinutes() + (value.minutes || 0), d.getSeconds() + (value.seconds || 0), d.getMilliseconds() + (value.milliseconds || 0));
        } else {
          _this21.value += value;
        }

        return _this21;
      });
    }
  }, {
    key: "replace",
    get: function get() {
      var _this22 = this;

      return this.__replace || (this.__replace = function (findWhat, replaceWith) {
        return _this22.mutate(CloneMode.None, function () {
          return true;
        }, function (next) {
          return next.replace(findWhat, replaceWith);
        });
      });
    }
  }]);

  return Modifier;
}();

function tryExtractPropNameFromAccessor(prop, fallback) {
  if (typeof prop === "function" && prop.propName) {
    return prop.propName;
  }

  return typeof fallback === "function" ? fallback(prop) : prop;
}

function processArgs(state, nextState, args, prop, subSpecs, path) {
  (Array.isArray(subSpecs) ? subSpecs.join(" ") : subSpecs).split(/\s+/).forEach(function (arg, index) {
    return args[arg] = args.$$[index];
  });
  return nextState;
}

function processWhen(state, nextState, args, prop, subSpecs, path) {
  var _subSpecs = _slicedToArray(subSpecs, 3),
      targetPath = _subSpecs[0],
      valueToCompare = _subSpecs[1],
      targetSpecs = _subSpecs[2];

  var targetValue = getValue(targetPath, _objectSpread({
    value: nextState
  }, args));

  if (targetValue === valueToCompare) {
    nextState = processSpecs(nextState, targetSpecs, args, path + ".");
  }

  return nextState;
}

function processArrayItemSpecs(state, nextState, args, prop, subSpecs, path) {
  if (Array.isArray(nextState)) {
    var many = prop === "$many";
    var defaultItemSpecs = typeof subSpecs === "function" ? undefined : subSpecs;
    var found = false;
    var hasChange = false;
    var nextArray = nextState.map(function (item, index) {
      if (found && !many) {
        return item;
      }

      var itemSpecs = defaultItemSpecs || subSpecs(_objectSpread({
        value: item,
        index: index
      }, args));
      if (!itemSpecs) return item;
      found = true;
      var newItem = processSpecs(item, itemSpecs, args, path + "." + index);

      if (newItem !== item) {
        hasChange = true;
      }

      return newItem;
    });

    if (hasChange) {
      nextState = nextArray;
    }
  }

  return nextState;
}

function processIf(state, nextState, args, prop, subSpecs, path) {
  var _subSpecs2 = _slicedToArray(subSpecs, 3),
      condition = _subSpecs2[0],
      $then = _subSpecs2[1],
      $else = _subSpecs2[2];

  var isTruth = typeof condition === "function" ? condition(_objectSpread({
    value: nextState
  }, args)) : condition;

  if (isTruth) {
    if ($then) {
      nextState = processSpecs(nextState, $then, args, path + ".");
    }
  } else if ($else) {
    nextState = processSpecs(nextState, $else, args, path + ".");
  }

  return nextState;
}

function processVar(state, nextState, args, prop, subSpecs, path) {
  if (typeof subSpecs === "function") {
    Object.assign(args, subSpecs(_objectSpread({
      value: nextState
    }, args)));
  } else {
    Object.entries(subSpecs).forEach(function (_ref2) {
      var _ref3 = _slicedToArray(_ref2, 2),
          varName = _ref3[0],
          path = _ref3[1];

      path = tryExtractPropNameFromAccessor(path);
      args[varName] = typeof path === "function" ? path(_objectSpread({
        value: nextState
      }, args)) : getValue(path, nextState);
    });
  }

  return nextState;
}

function processSelf(state, nextState, args, prop, subSpecs, path) {
  var modifier = new Modifier(nextState, args);
  nextState = subSpecs(modifier);

  if (modifier && modifier.original !== modifier.value) {
    nextState = modifier.value;
  }

  return nextState;
}

function cloneObject(state) {
  return Array.isArray(state) ? state.slice(0) : state instanceof Map ? new Map(state) : Object.assign({}, state);
}

function processNormalProp(state, nextState, args, prop, subSpecs, returnSpecs, returnValue, path) {
  if (_typeof(subSpecs) === "object" || typeof subSpecs === "string" || Array.isArray(subSpecs) || typeof subSpecs === "function") {// valid specs type
  } else {
    throw new Error("Invalid specs: ".concat(path + prop, ". Sub specs should be object, array or function"));
  }

  if (returnSpecs && typeof subSpecs !== "function") {
    returnValue[prop] = imj(subSpecs);
    return nextState;
  } // console.log(returnSpecs, prop, subSpecs);


  var props = Array.isArray(prop) ? prop.map(tryExtractPropNameFromAccessor) : tryExtractPropNameFromAccessor(prop).split(".");
  var isNestedProps = props.length > 1;
  prop = props[0];
  var modifier;
  var prevPropValue = isNestedProps ? getValue(props, nextState) : nextState[prop];
  var nextPropValue;

  if (typeof subSpecs === "function") {
    modifier = new Modifier(prevPropValue, args);
    nextPropValue = subSpecs(modifier);
  } else if (typeof subSpecs === "string") {
    nextPropValue = getValue(subSpecs, args);
  } else {
    nextPropValue = processSpecs(prevPropValue, subSpecs, args, path + prop + ".");
  } // there is something changed


  if (modifier && modifier.original !== modifier.value) {
    nextPropValue = modifier.value;
  }

  if (returnSpecs) {
    returnValue[prop] = nextPropValue;
    return nextState;
  }

  if (nextPropValue !== prevPropValue && !arrayEqual(nextPropValue, prevPropValue)) {
    if (nextState === state) {
      nextState = cloneObject(state);
    }

    if (isNestedProps) {
      var stack = [];
      var container = nextState;

      for (var i = 0; i < props.length; i++) {
        var prev = {
          container: container,
          prop: props[i]
        };
        stack.push(prev);
        prev.container[prev.prop] = container = cloneObject(container[prev.prop]);
      }

      var last = stack[stack.length - 1];
      last.container[last.prop] = nextPropValue;
    } else {
      nextState[prop] = nextPropValue;
    }
  }

  return nextState;
}

function processSpecs() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var specs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var path = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
  var nextState = state;
  var returnSpecs = false;
  var returnValue = {};
  var entries = Array.isArray(specs) ? specs.slice(0) : Object.entries(specs);
  var length = entries.length;

  for (var i = 0; i < length; i++) {
    var _entries$i = _slicedToArray(entries[i], 2),
        prop = _entries$i[0],
        subSpecs = _entries$i[1];

    if (prop === "$return") {
      returnSpecs = true;
      continue;
    }

    if (!subSpecs) {
      continue;
    }

    var isSpecialProp = true;

    if (typeof prop === "string" && prop[0] === "$") {
      if (prop === "$args") {
        nextState = processArgs(state, nextState, args, prop, subSpecs, path);
      } else if (prop === "$self") {
        nextState = processSelf(state, nextState, args, prop, subSpecs, path);
      } else if (prop === "$one" || prop === "$many") {
        nextState = processArrayItemSpecs(state, nextState, args, prop, subSpecs, path);
      } else if (prop === "$extend") {
        var nextSpecs = subSpecs(_objectSpread({
          value: nextState
        }, args));

        if (nextSpecs) {
          nextState = processSpecs(state, nextState, nextSpecs, args, path + prop + ".");
        }
      } else if (prop[1] === "w" && /^\$when/.test(prop)) {
        nextState = processWhen(state, nextState, args, prop, subSpecs, path);
      } else if (prop[1] === "i" && /^\$if/.test(prop)) {
        nextState = processIf(state, nextState, args, prop, subSpecs, path);
      } else if (prop[1] === "v" && /^\$var/.test(prop)) {
        nextState = processVar(state, nextState, args, prop, subSpecs, path);
      } else {
        isSpecialProp = false;
      }
    } else {
      isSpecialProp = false;
    }

    if (!isSpecialProp) {
      nextState = processNormalProp(state, nextState, args, prop, subSpecs, returnSpecs, returnValue, path);
    }
  }

  return returnSpecs ? returnValue : nextState;
}

function getValue(path, target) {
  return (Array.isArray(path) ? path : path.split(".")).reduce(function (target, prop) {
    prop = tryExtractPropNameFromAccessor(prop);
    return typeof target === "undefined" || target === null ? target : target[prop];
  }, target);
}

function imj() {
  for (var _len8 = arguments.length, inputs = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
    inputs[_key8] = arguments[_key8];
  }

  if (inputs.length > 1) {
    return imj(inputs[1]).apply(void 0, [inputs[0]].concat(_toConsumableArray(inputs.slice(2))));
  }

  var _inputs$ = inputs[0],
      specs = _inputs$ === void 0 ? {} : _inputs$;
  return function (state) {
    if (state instanceof Modifier) {
      state = state.value;
    }

    for (var _len9 = arguments.length, args = new Array(_len9 > 1 ? _len9 - 1 : 0), _key9 = 1; _key9 < _len9; _key9++) {
      args[_key9 - 1] = arguments[_key9];
    }

    return processSpecs(state, specs, _objectSpread({
      $$: args,
      $: state,
      $input: args[0]
    }, args.reduce(function (result, arg, index) {
      result["$".concat(index + 1)] = arg;
      return result;
    }, {})));
  };
}
//# sourceMappingURL=imj.js.map