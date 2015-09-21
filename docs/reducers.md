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

export function getInitialState() { return []; }

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

Introspection allows different actions to be taken depending on the store’s
state. The difference from the normal method (`getState()` in Redux) of checking
the store is an interface is created that the reducers implement to the
specifics of its state’s structure. It is completely encapsulated within the
reducer, allowing better coupling between actions and reducers.

Say a todo list allows importing items from online. The action creator may want
to only load data if it hasn’t done so already. Because action creators are
stateless, this bit of information will be stored in a reducer’s state somewhere.
Introspection methods allow a reducer to declare its preference, say with
needing to load data, whilst leaving the implementation details of the store
hidden from the action creator.

```javascript
// TodoListActions.js
import fetch from 'isomorphic-fetch';

export function addTodosFromURL({ items, URL }) {}

function importTodosFromURL({ URL }, { currentActionSet }) {
  fetch(URL)
  .then(response => response.json())
  .then(items => currentActionSet.addTodosFromURL({ items }));
}

export function importTodosFromURLIfNeeded({ URL }, { currentActionSet, getConsensus }) {
  if (getConsensus({
    introspectionID: 'hasImportedFromURL',
    payload: { URL },
    booleanOr: true
  })) {
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
