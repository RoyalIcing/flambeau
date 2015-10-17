# Reducers

## Props

Reducers in Flambeau are differentiated from the standard Redux reducer by a
number of modest features. One of these is the addition of props for reducers.

These props allow both the initial state and the state transformation during an
action to be customized. Like React’s props, their use is encouraged to enable
reducers to be less hard-coded and more reusable.

## Initial State

The initial state in Flambeau is determined by a declaration of the exported
function `getInitialState`. The props are passed as the first argument.

```javascript
export function getInitialState({ initialItems = [] }) {
  return {
    items: initialItems
  };
}
```

## Implementing Action Responders

Responding to actions is done in a similar manner to action creators: by
declaring functions. The name of the function mirrors that of the action
creator. The functions are declared in a vanilla JavaScript object, named the
same as the action set.

The only difference from action creators is the current state is passed as the
first argument.

```javascript
export const TodoListActions = {
  addTodo(state, { text }) {
    return state.concat({ text });
  }
}
```

## Composing

Reducers can be easily composed within each other. This allows you to break your
reducers into multiple pieces.

Forwarding actions is possible, especially easily done in bulk per action set.
To forward an action, declare an action set as a function instead of an object.
When an action from this set is dispatched, this function will be called with
the following parameters.
- `type`: either ACTION_TYPE or INTROSPECTION_TYPE.
- `actionID`: the identifier of the action or introspection method.
- `payload`: the payload being dispatched.
- `props`: the props of this particular reducer.
- `forwardTo()`: Call this to use another reducer on a subset of your state.

```javascript
// TodoItemActions.js

export function changeText({ text, index }) {}
export function changeCompleted({ isCompleted, index }) {}
```

```javascript
// TodoListReducer.js
import TodoItemReducer from './TodoItemReducer';

export function getInitialState() {
  return {
    items: []
  };
}

export function TodoItemActions(state, { type, actionID, payload, props, forwardTo }) {
  const { index } = payload;
  state = Object.assign({}, state, {
    items: state.items.concat() // Make a copy of the entire array
  });
  state.items[index] = forwardTo({ responder: TodoItemReducer, initialState: state.items[index] });

  return state;
}
```

```javascript
// TodoItemReducer.js

export const TodoItemActions = {
  changeText(item, { text, index }) {
    return Object.assign({}, item, { text });
  },

  changeCompleted(item, { isCompleted, index }) {
    return Object.assign({}, item, { isCompleted });
  }
}
```

## Introspection

An application will often need different actions to be taken depending on the
store’s state. Differing from the normal method of directly checking the store
(`getState()` in Redux), Flambeau introduces *introspection* methods, which
allow reducers to completely encapsulate the specifics of its state’s structure.

Say a todo list allows importing items from a URL online. The import action
creator may want to only load data if it hasn’t been done already. Because
action creators are stateless, this bit of information will be stored by a
reducer somewhere.

Introspection methods allow a reducer to declare its preference, say whether to
load a URL or not, whilst leaving the implementation details of the store’s
state hidden from the action creator.

```javascript
// TodoListActions.js
import fetch from 'isomorphic-fetch';

export function addTodosFromURL({ items, URL }) {}

function importTodosFromURL({ URL }, { currentActionSet }) {
  fetch(URL)
  .then(response => response.json())
  .then(items => currentActionSet.addTodosFromURL({ items, URL }));
}

export function importTodosFromURLIfNeeded({ URL }, { currentActionSet }) {
  if (!currentActionSet.getConsensus.hasImportedFromURL({ URL }).every()) {
    // This function is not exported as a public action, instead used directly.
    importTodosFromURL({ URL }, { currentActionSet });
  }
}

export const introspection = {
  hasImportedFromURL({ URL }) {}
};
```

```javascript
// TodoListReducer.js
export function getInitialState({ initialItems = [] }) {
  return {
    items: initialItems,
    importedURLs: {}
  };
}

export const TodoListActions = {
  addTodosFromURL(state, { items, URL }) {
    // Other reducers might have returned false from hasImportedFromURL()
    if (state.importedURLs[URL]) {
      return;
    }

    return Object.assign({}, state, {
      importedURLs: Object.assign({}, state.importedURLs, { [URL]: true }),
      items: state.items.concat(items)
    });
  },

  introspection: {
    hasImportedFromURL(state, { URL }) {
      return Boolean(
        state.importedURLs[URL]
      );
    }
  }
};
```

## Introspection Consensus

The `getConsensus` property is part of every connected action set, including
those passed to action creators (`currentActionSet` and `allActionSets`), that
have introspection methods.

To use it, append your introspection identifier, and call it with the payload to
pass to each reducer’s introspection method. Then call one of the following
methods:

- `some([callback])`: like `Array.some`, returns true if callback returns true for any reducer’s
result.
If a callback is not passed, then the result is treated as a boolean.
- `every([callback])`: like `Array.every`, returns true if callback returns true for every reducer’s
result.
If a callback is not passed, then the result is treated as a boolean.
- `reduce(callback[, initialValue])`: like `Array.reduce`, combines every
reducer’s result using a callback passed the combined result so far, and the
currently iterated reducer’s result for the introspection method.
- `toArray()`: returns an array of results of every reducer for this
introspection method.

```javascript
const combinedResult = currentActionSet.getConsensus.yourIntrospectionID({
  yourPayloadProperties: true
}).reduce((combined, current) => {
  // Reduce `combined` and `current`
  return combined + current;
}, /* optional initialValue */ 0);
```

```javascript
if (currentActionSet.getConsensus.yourIntrospectionID({
  yourPayloadProperties: true
}).some()) {
  // Any reducer returned true.
}
```

```javascript
if (currentActionSet.getConsensus.yourIntrospectionID({
  yourPayloadProperties: true
}).every()) {
  // All reducers returned true.
}
```
