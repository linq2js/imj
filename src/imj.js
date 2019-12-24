const CloneMode = {
  None: 0,
  Unknown: 1,
  Object: 2,
  Array: 3
};
const defaultSelector = x => x;

function arrayEqual(arr1, arr2) {
  if (arr1 === arr2) return true;
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
  if (!Array.isArray(arr1) || Array.isArray(arr2)) return false;
  return arr1.every((item, index) => arr2[index] === item);
}

class Modifier {
  constructor(value, args) {
    this.original = value;
    this.value = value;
    Object.assign(this, args, {
      __arrayProxy: (method, clone, args = []) => {
        let modifiedArray;
        return this.mutate(
          CloneMode.None,
          original => {
            if (typeof original === "undefined" || original === null) {
              original = [];
            }
            modifiedArray = (clone ? original.slice(0) : original)[method](
              ...args
            );
            return (
              modifiedArray.length !== original.length ||
              modifiedArray.some((item, index) => item !== original[index])
            );
          },
          () => modifiedArray
        );
      },

      orderBy: selector => {
        return this.sort((a, b) => {
          const aValue = selector(a);
          const bValue = selector(b);
          if (aValue > bValue) {
            return 1;
          }
          return aValue === bValue ? 0 : -1;
        });
      },

      reverse: () => {
        return this.__arrayProxy("reverse", true);
      },

      sort: comparer => {
        return this.__arrayProxy("sort", true, [comparer]);
      },

      filter: predicate => {
        return this.__arrayProxy("filter", false, [predicate]);
      },

      slice: (from, to) => {
        return this.__arrayProxy("slice", false, [from, to]);
      },

      shift: () => {
        return this.mutate(
          CloneMode.Array,
          prev => prev && prev.length,
          next => next.shift()
        );
      },

      remove: (...keys) => {
        keys = keys.map(tryExtractPropNameFromAccessor);

        return this.mutate(
          CloneMode.Unknown,
          prev =>
            prev &&
            (prev instanceof Set || prev instanceof Map
              ? keys.some(key => prev.has(key))
              : keys.some(key => key in prev)),
          next => {
            if (Array.isArray(next)) {
              const sortedKeys = keys.sort();
              while (sortedKeys.length) {
                next.splice(sortedKeys.pop(), 1);
              }
            } else if (next instanceof Map || next instanceof Set) {
              keys.forEach(key => next.delete(key));
            } else {
              keys.forEach(key => delete next[key]);
            }
          }
        );
      },

      pop: () => {
        return this.mutate(
          CloneMode.Array,
          prev => prev && prev.length,
          next => next.pop()
        );
      },

      keep: (...keys) => {
        keys = keys.map(tryExtractPropNameFromAccessor);
        return this.mutate(
          CloneMode.Unknown,
          () => true,
          prev => prev,
          next => {
            if (next instanceof Map) {
              return keys.reduce((map, key) => {
                map.set(key, next.get(key));
                return map;
              }, new Map());
            }

            if (Array.isArray(next)) {
              return keys.map(key => next[key]);
            }

            if (typeof next === "undefined" || next === null) {
              return {};
            }

            return keys.reduce((obj, key) => {
              obj[key] = next[key];
              return obj;
            }, {});
          }
        );
      },

      unshift: (...values) => {
        return this.mutate(
          CloneMode.None,
          () => !!values.length,
          next => values.concat(next || [])
        );
      },

      splice: (index, count, ...newItems) => {
        return this.mutate(
          CloneMode.Array,
          prev => prev && ((count && prev.length > index) || newItems.length),
          next => next.splice(index, count, ...newItems)
        );
      },

      result: () => this.__result,

      unset: (...props) => {
        props = props.map(tryExtractPropNameFromAccessor);
        return this.mutate(
          CloneMode.Unknown,
          prev => prev && props.some(prop => prop in prev),
          next => props.forEach(prop => delete next[prop])
        );
      },

      mutate: (cloneMode, checker, modifier, selector = defaultSelector) => {
        let value = this.value;

        // do nothing
        if (!checker(value)) {
          return this;
        }

        if (cloneMode && value === this.original) {
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
          } else if (typeof value === "object") {
            value = Object.assign({}, selector(value));
          }
        }

        const next = modifier(value);
        if (cloneMode) {
          this.value = value;
          this.__result = next;
        } else {
          this.value = next;
        }

        return this;
      },

      push: (...values) => {
        return this.mutate(
          CloneMode.None,
          () => values.length,
          next => [].concat(next || []).concat(values)
        );
      },

      assign: (...newProps) => {
        const finalProps = Object.assign({}, ...newProps);
        return this.mutate(
          CloneMode.Object,
          prev =>
            !prev ||
            Object.keys(finalProps).some(key => finalProps[key] !== prev[key]),
          next => Object.assign(next, finalProps)
        );
      },

      map: mapper => {
        let clonedValue;
        return this.mutate(
          CloneMode.None,
          prev => {
            if (!prev) return true;
            clonedValue = prev.map(mapper);
            return !arrayEqual(clonedValue, prev);
          },
          () => clonedValue
        );
      },

      swap: (prop1, prop2) =>
        this.mutate(
          CloneMode.Unknown,
          prev => !prev || prev[prop1] !== prev[prop2],
          next => {
            const temp = next[prop1];
            next[prop1] = next[prop2];
            next[prop2] = temp;
          }
        ),

      replace: (findWhat, replaceWith) =>
        this.mutate(
          CloneMode.None,
          () => true,
          next => next.replace(findWhat, replaceWith)
        ),

      toggle: () => {
        this.value = !this.value;
        return this;
      },

      add: (value = 1) => {
        if (
          this.value instanceof Date ||
          (typeof this.value === "string" && typeof value !== "string")
        ) {
          const d = new Date(this.value);
          this.value = new Date(
            d.getFullYear() + (value.years || 0),
            d.getMonth() + (value.months || 0),
            d.getDate() + (value.days || 0),
            d.getHours() + (value.hours || 0),
            d.getMinutes() + (value.minutes || 0),
            d.getSeconds() + (value.seconds || 0),
            d.getMilliseconds() + (value.milliseconds || 0)
          );
        } else {
          this.value += value;
        }
        return this;
      },

      current: () => this.value
    });
  }
}

function tryExtractPropNameFromAccessor(prop, fallback) {
  if (typeof prop === "function" && prop.propName) {
    return prop.propName;
  }
  return typeof fallback === "function" ? fallback(prop) : prop;
}

function processArgs(state, nextState, args, prop, subSpecs, path) {
  (Array.isArray(subSpecs) ? subSpecs.join(" ") : subSpecs)
    .split(/\s+/)
    .forEach((arg, index) => (args[arg] = args.$$[index]));
  return nextState;
}

function processWhen(state, nextState, args, prop, subSpecs, path) {
  const [targetPath, valueToCompare, targetSpecs] = subSpecs;
  const targetValue = getValue(targetPath, { value: nextState, ...args });
  if (targetValue === valueToCompare) {
    nextState = processSpecs(nextState, targetSpecs, args, path + ".");
  }
  return nextState;
}

function processArrayItemSpecs(state, nextState, args, prop, subSpecs, path) {
  if (Array.isArray(nextState)) {
    const many = prop === "$many";
    let found = false;
    let hasChange = false;
    const nextArray = nextState.map((item, index) => {
      if (found && !many) {
        return item;
      }
      const itemSpecs = subSpecs({ value: item, index, ...args });
      if (!itemSpecs) return item;
      found = true;
      const newItem = processSpecs(item, itemSpecs, args, path + "." + index);
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
  const [condition, $then, $else] = subSpecs;
  const isTruth =
    typeof condition === "function"
      ? condition({ value: nextState, ...args })
      : condition;

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
    Object.assign(args, subSpecs({ value: nextState, ...args }));
  } else {
    Object.entries(subSpecs).forEach(([varName, path]) => {
      path = tryExtractPropNameFromAccessor(path);
      args[varName] =
        typeof path === "function"
          ? path({ value: nextState, ...args })
          : getValue(path, nextState);
    });
  }
  return nextState;
}

function processSelf(state, nextState, args, prop, subSpecs, path) {
  let modifier = new Modifier(nextState, args);
  nextState = subSpecs(modifier);
  if (modifier && modifier.original !== modifier.value) {
    nextState = modifier.value;
  }

  return nextState;
}

function cloneObject(state) {
  return Array.isArray(state)
    ? state.slice(0)
    : state instanceof Map
      ? new Map(state)
      : Object.assign({}, state);
}

function processNormalProp(
  state,
  nextState,
  args,
  prop,
  subSpecs,
  returnSpecs,
  returnValue,
  path
) {
  if (
    typeof subSpecs === "object" ||
    typeof subSpecs === "string" ||
    Array.isArray(subSpecs) ||
    typeof subSpecs === "function"
  ) {
    // valid specs type
  } else {
    throw new Error(
      `Invalid specs: ${path +
      prop}. Sub specs should be object, array or function`
    );
  }

  if (returnSpecs && typeof subSpecs !== "function") {
    returnValue[prop] = imj(subSpecs);
    return nextState;
  }

  // console.log(returnSpecs, prop, subSpecs);

  const props = Array.isArray(prop)
    ? prop.map(tryExtractPropNameFromAccessor)
    : tryExtractPropNameFromAccessor(prop).split(".");
  const isNestedProps = props.length > 1;

  prop = props[0];
  let modifier;

  const prevPropValue = isNestedProps
    ? getValue(props, nextState)
    : nextState[prop];
  let nextPropValue;

  if (typeof subSpecs === "function") {
    modifier = new Modifier(prevPropValue, args);
    nextPropValue = subSpecs(modifier);
  } else if (typeof subSpecs === "string") {
    nextPropValue = getValue(subSpecs, args);
  } else {
    nextPropValue = processSpecs(
      prevPropValue,
      subSpecs,
      args,
      path + prop + "."
    );
  }

  // there is something changed
  if (modifier && modifier.original !== modifier.value) {
    nextPropValue = modifier.value;
  }

  if (returnSpecs) {
    returnValue[prop] = nextPropValue;
    return nextState;
  }

  if (
    nextPropValue !== prevPropValue &&
    !arrayEqual(nextPropValue, prevPropValue)
  ) {
    if (nextState === state) {
      nextState = cloneObject(state);
    }
    if (isNestedProps) {
      const stack = [];
      let container = nextState;
      for (let i = 0; i < props.length; i++) {
        let prev = { container, prop: props[i] };
        stack.push(prev);
        prev.container[prev.prop] = container = cloneObject(
          container[prev.prop]
        );
      }
      const last = stack[stack.length - 1];
      last.container[last.prop] = nextPropValue;
    } else {
      nextState[prop] = nextPropValue;
    }
  }
  return nextState;
}

function processSpecs(state = {}, specs = {}, args = {}, path = "") {
  let nextState = state;
  let returnSpecs = false;
  let returnValue = {};
  const entries = Array.isArray(specs) ? specs.slice(0) : Object.entries(specs);
  const length = entries.length;
  for (let i = 0; i < length; i++) {
    let [prop, subSpecs] = entries[i];

    if (prop === "$return") {
      returnSpecs = true;
      continue;
    }

    if (!subSpecs) {
      continue;
    }
    let isSpecialProp = true;
    if (typeof prop === "string" && prop[0] === "$") {
      if (prop === "$args") {
        nextState = processArgs(state, nextState, args, prop, subSpecs, path);
      } else if (prop === "$self") {
        nextState = processSelf(state, nextState, args, prop, subSpecs, path);
      } else if (prop === "$one" || prop === "$many") {
        nextState = processArrayItemSpecs(
          state,
          nextState,
          args,
          prop,
          subSpecs,
          path
        );
      } else if (prop === "$extend") {
        const nextSpecs = subSpecs({ value: nextState, ...args });
        if (nextSpecs) {
          nextState = processSpecs(
            state,
            nextState,
            nextSpecs,
            args,
            path + prop + "."
          );
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
      nextState = processNormalProp(
        state,
        nextState,
        args,
        prop,
        subSpecs,
        returnSpecs,
        returnValue,
        path
      );
    }
  }

  return returnSpecs ? returnValue : nextState;
}

function getValue(path, target) {
  return (Array.isArray(path) ? path : path.split(".")).reduce(
    (target, prop) => {
      prop = tryExtractPropNameFromAccessor(prop);
      return typeof target === "undefined" || target === null
        ? target
        : target[prop];
    },
    target
  );
}

export default function imj(...inputs) {
  if (inputs.length > 1) {
    return imj(inputs[1])(inputs[0], ...inputs.slice(2));
  }
  const [specs = {}] = inputs;
  return (state, ...args) => {
    if (state instanceof Modifier) {
      state = state.value;
    }
    return processSpecs(state, specs, {
      $$: args,
      $: state,
      $input: args[0],
      // automap input args to props: $1, $2, $3, ...
      ...args.reduce((result, arg, index) => {
        result[`$${index + 1}`] = arg;
        return result;
      }, {})
    });
  };
}
