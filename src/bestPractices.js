import imj from "src/imj";

function reduxUpdateVeryNestedField(state, action) {
  return {
    ...state,
    first: {
      ...state.first,
      second: {
        ...state.first.second,
        [action.someId]: {
          ...state.first.second[action.someId],
          fourth: action.someValue
        }
      }
    }
  };
}

/*
imez()
  .set()
  .set()
  .update(path, modifer)
  .update(path2, modifer)


const update = imj({
  propName: modifier1,
  propName2: modifier2,
  subProp: {
    subProp: {

    }
  },

  'prop1.prop2.prop3': {
    // specs
  }
})

update(state1)
update(state2)

modifer => func(context) => newValue

context.value
context.xys
context.arg1
context.splice
context.push
context.pop



 */

const imjUpdateVeryNestedField = imj({
  $args: "$action",
  first: {
    second: {
      $extend: ({ $action }) => ({
        [$action.someId]: {
          fourth: () => $action.someValue
        }
      })
    }
  }
});

function reduxInsertItem(array, action) {
  return [
    ...array.slice(0, action.index),
    action.item,
    ...array.slice(action.index)
  ];
}

const imjInsertItem = imj({
  $args: "$action",
  array: ({ $action, splice }) => splice($action.index, 0, $action.item)
});
