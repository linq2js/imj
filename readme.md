# imj

Not fastest but powerful immutable helper

## Simple update

```js
import imj from "imj";

const Increase = imj({
  count: ({ value }) => value + 1
});
const Decrease = imj({
  count: ({ value }) => value - 1
});
Increase({ count: 1 }); // { count: 2 }
Decrease({ count: 1 }); // { count: 0 }
```

## Retrieve argument values

```js
import imj from "imj";

const Increase = imj({
  count: ({ value, $1 = 1 }) => value + $1
});

Increase({ count: 1 }); // { count: 2 }
Increase({ count: 1 }, 2); // { count: 3 }
```

## Update array

```js
import imj from "imj";

const AddTodo = imj({
  // map second argument to $text and the third to $done
  $args: "$text $done",
  todos: ({ $text, $done, push }) =>
    // push new item to todos array
    push({ text: $text, done: $done })
});

AddTodo({ todos: [{ text: "first", done: false }] }, "second", true);
// { todos: [ { text: 'first', done: false }, { text: 'second', done: true } ] }
```

## Update specified items in array

```js
import imj from "imj";

const ToggleDoneSpecs = { done: ({ toggle }) => toggle() };

const ToggleTodoByIndex = imj({
  $args: "$index",
  // create custom specs
  $extend: ({ $index }) => ({
    todos: {
      // toggle done property of specified item ($index)
      [$index]: ToggleDoneSpecs
    }
  })
});

const ToggleOneTodoByText = imj({
  $args: "$text",
  todos: {
    // update first match only
    $one: ({ value, $text }) =>
      value.text === $text
        ? // return specs for matched item
          ToggleDoneSpecs
        : // unless do nothing
          null
  }
});

const ToggleAllTodoByText = imj({
  $args: "$text",
  todos: {
    // update all
    $many: ({ value, $text }) =>
      value.text === $text
        ? // return specs for matched item
          ToggleDoneSpecs
        : // unless do nothing
          null
  }
});

const ToggleAll = imj({
  todos: {
    $many: ToggleDoneSpecs
  }
});
```

## Simple redux reducer

```js
import imj from "imj";

const IncreaseAction = 1;
const DecreaseAction = 2;
const reducer = imj({
  $when: [
    "$1.type",
    {
      [IncreaseAction]: {
        count: ({ value, $1: { payload = 1 } }) => value + payload
      },
      [DecreaseAction]: {
        count: ({ value, $1: { payload = 1 } }) => value - payload
      }
    }
  ]
});
reducer({ count: 1 }, { type: IncreaseAction }); // { count: 2 }
reducer({ count: 1 }, { type: IncreaseAction, payload: 2 }); // { count: 3 }
reducer({ count: 1 }, { type: DecreaseAction }); // { count: 0 }
reducer({ count: 1 }, { type: DecreaseAction, payload: 2 }); // { count: -1 }
```

## Other implementation

```js
import imj from "imj";

const IncreaseAction = 1;
const DecreaseAction = 2;
const reducer = imj({
  // define named $when
  $when_increase: [
    "$1.type",
    IncreaseAction,
    {
      count: ({ value, $1: { payload = 1 } }) => value + payload
    }
  ],
  $when_decrease: [
    "$1.type",
    DecreaseAction,
    {
      count: ({ value, $1: { payload = 1 } }) => value - payload
    }
  ]
});
```
