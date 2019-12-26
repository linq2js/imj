import imj from "./imj";

test("simple prop mutating", () => {
  const prev = { name: "Peter", age: 20 };
  const update = imj({
    name: ({ value }) => value + " Parker"
  });
  const next = update(prev);

  expect(next).toEqual({
    name: "Peter Parker",
    age: 20
  });
});

test("array as specs", () => {
  const prev = { name: "Peter", age: 20 };
  const update = imj([
    ["name", ({ value }) => value + " Parker"],
    ["age", ({ value }) => value + 1]
  ]);
  const next = update(prev);

  expect(next).toEqual({
    name: "Peter Parker",
    age: 21
  });
});

test("nested props", () => {
  const prev = { level1: { level2: {} } };
  const update = imj({
    level1: {
      level2: () => ({ level3: {} })
    },
    "level1.level2.level3": {
      value: () => 100
    }
  });
  const next = update(prev);

  expect(next).toEqual({
    level1: { level2: { level3: { value: 100 } } }
  });
});

test("swap()", () => {
  const prev = { array: [1, 2, 3] };
  const update = imj({
    array: ({ swap }) => swap(0, 2)
  });
  const next = update(prev);

  expect(next).toEqual({
    array: [3, 2, 1]
  });
});

test("toggle()", () => {
  const prev = { flag: true };
  const update = imj({
    flag: ({ toggle }) => toggle()
  });
  const next = update(prev);

  expect(next).toEqual({
    flag: false
  });
});

test("replace()", () => {
  const prev = { email: "linqtojs@yahoo.com" };
  const update = imj({
    email: ({ replace }) => replace("yahoo", "gmail")
  });
  const next = update(prev);

  expect(next).toEqual({
    email: "linqtojs@gmail.com"
  });
});

test("push()", () => {
  const prev = { values: [1], other: { value: 100 } };
  const update = imj({
    $var: { $other: "other.value" },
    values: ({ push, $other }) => push(2, 3, 4, $other)
  });
  const next = update(prev);

  expect(next).toEqual({
    values: [1, 2, 3, 4, 100],
    other: { value: 100 }
  });
});

test("batch processing", () => {
  const prev = { array: [1, 2, 3, 4] };
  const update = imj({
    array: ({ push, pop }) => {
      push(5);
      push(6);
      pop();
    }
  });
  const next = update(prev);

  expect(next).toEqual({
    array: [1, 2, 3, 4, 5]
  });
});

test("complexity updating", () => {
  const prev = {
    name: "Peter",
    age: 30,
    birthday: "1989-12-01",
    wife: { name: "Kate", age: 30 },
    children: [
      { name: "Tom", age: 5 },
      { name: "Mary", age: 1 }
    ]
  };
  const update = imj({
    name: () => "Peter Parker",
    birthday: ({ add }) => add({ years: 1 }),
    children: {
      0: {
        age: ({ value }) => value + 1
      },
      1: {
        age: ({ add }) => add(2)
      }
    },
    wife: ({ keep }) => keep("name")
  });
  const next = update(prev);

  expect(next).toEqual({
    name: "Peter Parker",
    age: 30,
    birthday: new Date("1990-12-01"),
    wife: { name: "Kate" },
    children: [
      { name: "Tom", age: 6 },
      { name: "Mary", age: 3 }
    ]
  });
});

test("conditional updating", () => {
  const prev = {
    name: "Peter",
    age: 30,
    wife: { name: "Kate", age: 30 }
  };
  const update1 = imj({
    wife: {
      $if: [({ value }) => value.age >= 30, { elder: () => true }]
    }
  });

  const update2 = imj({
    wife: {
      $if: [({ value }) => value.age > 40, null, { young: () => true }]
    }
  });

  expect(update1(prev)).toEqual({
    name: "Peter",
    age: 30,
    wife: { name: "Kate", age: 30, elder: true }
  });

  expect(update2(prev)).toEqual({
    name: "Peter",
    age: 30,
    wife: { name: "Kate", age: 30, young: true }
  });

  const reducer = imj({
    // indicate that reducer retrieves 2 arguments, the first one is current target that need to update, the second one is 'action'
    $args: "action",
    $when_increase: ["action.type", 1, { count: ({ value }) => value + 1 }],
    $when_decrease: ["action.type", 2, { count: ({ value }) => value - 1 }]
  });

  expect(reducer({ count: 1 }, { type: 1 })).toEqual({ count: 2 });
  expect(reducer({ count: 1 }, { type: 2 })).toEqual({ count: 0 });
});

test("single specs for all state update", () => {
  const specs = LoadProducts({ pagination: { page: 0, size: 10 } });
  const beforeState = specs.before();
  const successState = specs.success(beforeState, {
    paginatedResults: [1, 2, 3],
    totalCount: 3
  });
  expect(beforeState).toEqual({
    searchTerms: { loading: true, pagination: { page: 0, size: 10 } },
    searchProductResult: []
  });
  expect(successState).toEqual({
    searchTerms: {
      loading: false,
      more: false,
      total: 3,
      pagination: { page: 0, size: 10 }
    },
    searchProductResult: [1, 2, 3]
  });
});

test("$one()", () => {
  const prev = {
    array: [{ data: 1 }, { data: 2 }, { data: 3 }]
  };
  const update = imj({
    array: {
      $one({ value }) {
        return value.data % 2 === 1 ? { data: () => 5 } : undefined;
      }
    }
  });
  const next = update(prev);
  expect(next).toEqual({
    array: [{ data: 5 }, { data: 2 }, { data: 3 }]
  });
});

test("$many()", () => {
  const prev = {
    array: [{ data: 1 }, { data: 2 }, { data: 3 }]
  };
  const update = imj({
    array: {
      $many({ value }) {
        return value.data % 2 === 1 ? { data: () => 5 } : undefined;
      }
    }
  });
  const next = update(prev);
  expect(next).toEqual({
    array: [{ data: 5 }, { data: 2 }, { data: 5 }]
  });
});

function LoadProducts(terms) {
  const $searchTerms = createAccessor("searchTerms");
  const $searchProductResult = createAccessor("searchProductResult");

  return {
    // create func that updates search terms and search product result
    before: imj({
      [$searchTerms]: () => terms,
      [$searchProductResult]: () => [],
      [$searchTerms.prop("loading")]: () => true
    }),
    success: imj({
      // naming input arguments
      $args: "$result",
      // define some variables for late usages
      $var: {
        $page: $searchTerms.prop("pagination.page"),
        $size: $searchTerms.prop("pagination.size")
      },
      // update search result
      [$searchProductResult]: ({ $result }) => $result.paginatedResults,
      // update search terms
      [$searchTerms]: {
        // stop loading indicator
        loading: () => false,
        total: ({ $result }) => $result.totalCount,
        // check there is more items or not
        more: ({ $page, $size, $result }) =>
          ($page + 1) * $size < $result.totalCount
      }
    })
  };
}

test("custom $var", () => {
  const update = imj({
    $var: ({ $1 }) => ({ arg1: $1 }),
    data: ({ arg1 }) => arg1
  });

  expect(update({ data: 0 }, 100)).toEqual({ data: 100 });
});

test("$return", () => {
  const f = imj({
    $return: true,
    $args: "$action",
    $async: ({ $action }) => [$action],
    success: {
      $args: "$step",
      data: ({ value, $step }) => value + $step
    }
  });

  const o = { data: 100 };
  const a = f(o, "something");
  expect(a).toEqual({
    $async: ["something"],
    success: expect.any(Function)
  });
  const b = a.success(o, 200);
  expect(b).toEqual({
    data: 300
  });
});

function createAccessor(getterOrPropName, reducer, defaultValue) {
  let getter = getterOrPropName;
  let propName;
  if (typeof getterOrPropName !== "function") {
    propName = getterOrPropName;
    defaultValue = reducer;
    const prop = getter;
    reducer = (state, value, original) => {
      const current = getter(state);
      if (typeof value === "function") {
        value = value(current);
      }
      if (current === value) return state;
      if (!original || state === original) {
        state = {
          ...state
        };
      }
      state[prop] = value;
      return state;
    };
    let defaultValueCache;
    getter = state =>
      prop in state
        ? state[prop]
        : defaultValueCache
        ? defaultValueCache.value
        : (defaultValueCache = {
            value:
              typeof defaultValue === "function" ? defaultValue() : defaultValue
          }).value;
  }
  const accessor = Object.assign(
    function(state, value, original) {
      if (arguments.length < 2) {
        return getter(state);
      }
      if (!reducer) {
        throw new Error("No reducer presents");
      }
      return reducer(state, value, original);
    },
    {
      isAccessor: true,
      propName,
      select: (...props) => (...args) =>
        props.reduce((value, prop) => value[prop], accessor(...args))
    }
  );

  if (propName) {
    accessor.toString = () => propName;
  }

  createPropSelectorForAccessor(accessor);

  return accessor;
}

test("support evaluate var value from string", () => {
  const update = imj({
    $var: ({ $1 }) => ({
      $test: {
        data: $1
      }
    }),
    data: "$test.data"
  });
  expect(update({ data: 0 }, 100)).toEqual({
    data: 100
  });
});

test("self assignment", () => {
  const update = imj({
    $self: ({assign}) => assign({a: 1}, {b: 2})
  });
  expect(update({data: 0})).toEqual({
    data: 0,
    a: 1,
    b: 2
  });
});

test("handle action.type", () => {
  const IncreaseAction = 1;
  const DecreaseAction = 2;
  const reducer = imj({
    $when: [
      "$1.type",
      {
        [IncreaseAction]: {
          count: ({value, $1: {payload = 1}}) => value + payload
        },
        [DecreaseAction]: {
          count: ({value, $1: {payload = 1}}) => value - payload
        }
      }
    ]
  });

  expect(reducer({count: 1}, {type: IncreaseAction})).toEqual({count: 2});
  expect(reducer({count: 1}, {type: IncreaseAction, payload: 2})).toEqual({
    count: 3
  });
  expect(reducer({count: 1}, {type: DecreaseAction})).toEqual({count: 0});
  expect(reducer({count: 1}, {type: DecreaseAction, payload: 2})).toEqual({
    count: -1
  });
});

test("using literal shortcut", () => {
  const prev = {
    count: 0,
    offset: 0,
    searchText: "",
    items: null,
    requestId: null,
    status: {
      isError: false,
      isLoading: false,
      isSuccess: false
    },
    error: {},
    selectedItem: {},
    editedItem: {}
  };

  const next = imj(prev, {
    count: [120],
    offset: [10],
    searchText: ["Text"],
    items: [null],
    status: {
      isLoading: [true],
      isError: [false],
      isSuccess: [false]
    },
    selectedItem: [undefined],
    editedItem: [undefined],
    error: [undefined]
  });

  expect(next).toEqual({
    count: 120,
    offset: 10,
    searchText: "Text",
    items: null,
    requestId: null,
    status: {
      isLoading: true,
      isError: false,
      isSuccess: false
    },
    error: undefined,
    selectedItem: undefined,
    editedItem: undefined
  });
});

test("extend() specs", () => {
  const mainReducerSpecs = {
    $when: ["$1.type", "loadProducts", {products: [[{id: 1}, {id: 2}]]}]
  };

  const mainReducer = imj(mainReducerSpecs);

  mainReducer.extend({
    $scope_user: {
      $when: ["$1.type", "loadProfile", {profile: [{name: "admin"}]}]
    }
  });

  mainReducer.extend({
    $scope_blog: {
      $when: ["$1.type", "loadPosts", {posts: [[{id: 3}, {id: 4}]]}]
    }
  });

  let state = {};

  state = mainReducer(state, {type: "loadProfile"});
  expect(state).toEqual({profile: {name: "admin"}});

  state = mainReducer(state, {type: "loadProducts"});
  expect(state).toEqual({
    profile: {name: "admin"},
    products: [{id: 1}, {id: 2}]
  });

  state = mainReducer(state, {type: "loadPosts"});
  expect(state).toEqual({
    profile: {name: "admin"},
    products: [{id: 1}, {id: 2}],
    posts: [{id: 3}, {id: 4}]
  });
});

function createPropSelectorForAccessor(accessor) {
  accessor.prop = path => {
    if (accessor[`__` + path]) {
      return accessor["__" + path];
    }
    const props = path.split(".");
    const newAccessor = state =>
      props.reduce(
        (target, prop) =>
          typeof target === "undefined" || target === null
            ? undefined
            : target[prop],
        accessor(state)
      );

    createPropSelectorForAccessor(newAccessor);

    if (accessor.propName) {
      newAccessor.propName = accessor.propName + "." + path;
      newAccessor.toString = () => newAccessor.propName;
    }

    return (accessor["__" + path] = newAccessor);
  };
}
