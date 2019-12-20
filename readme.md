# imj

Small, fast, easy to use immutable helper

## Simple reducer

```js
import imj from "imj";

const reducer = imj({
  counter: ({ value }) => value + 1
});
```

## Reducer with input arguments

```js
import imj from "imj";

const actionTypes = {
  increase: 1,
  decrease: 2
};
// using $when and return individual specs for each action type
// can specific specs to update multiple props at once
const reducer1 = imj({
  // indicate that reducer retrieves 2 arguments, the first one is current target that need to update, the second one is 'action'
  $args: "action",
  $when_increase: [
    "action.type",
    actionTypes.increase,
    { count: ({ value }) => value + 1 }
  ],
  $when_decrease: [
    "action.type",
    actionTypes.decrease,
    { count: ({ value }) => value - 1 }
  ]
});
// using normal updater and check action.type before return approx value
// this works with only prop
const reducer2 = imj({
  $args: "action",
  count: ({ value, action }) =>
    action.type === actionTypes.increase ? value + 1 : value - 1
});
```
