# Flambeau
A lightweight Flux (& Redux compatible) library with opinions:

### Declarative Action Creators
```javascript
export function addTodo({ text }) {} // No constants, self-documenting payload
```
- **No UPPERCASE_CONSTANTS**. Just use an exported function to name the action, and a destructured object to document the payload.
- Better organized actions with simple **namespacing** using action sets.
- **Async action support built-in**, with convenient dispatching of other actions.

### Reusable Reducers
- **No switch statements** to handle actions, just declare a function with the same name as the action’s function, inside an exported object with the same name as the action set.
- **Redux-style reducers** instead of stores, using pure functions to allow clear data flow and immutability.
- **Reusable reducers, using props to customize** the initial state or response to actions.
- **Bulk forwarding of action sets** within reducers to allow easy composition of reducers, such as in collections or other hierarchies.

### Reducer Encapsulation
- **Introspection methods to allow encapsulation** of reducers’ internal state.
- Get a **consensus for async actions**, such as whether something needs loading, by polling reducers using their introspection methods. This removes coupling between reducers and actions, allowing greater code reuse.

## Installation

`npm install flambeau --save`

## Documentation

- [Actions](docs/actions.md)
- [Reducers](docs/reducers.md)
- [Using with Redux](docs/redux.md)

## Example

### Actions

```javascript
// actions/TodoListActions.js

import fetch from 'isomorphic-fetch';

// Simple action, which documents its payload, unlike a constant.
export function addTodo({ text }) {}

// Asynchronous action. Just add a second argument and use `currentActionSet` to
// dispatch any number of actions.
export function importTodosFromURL({ URL }, { currentActionSet }) {
  fetch(URL)
  .then(response => response.json())
  .then(items => {
    items.forEach(item => {
      currentActionSet.addTodo({ text: item.text });
    });
  })
}
```

### Reducer

```javascript
// reducers/TodoListReducer.js

export function getInitialState() {
  return [];
}

// Namespaced to action sets
export const TodoListActions = {
  addTodo(state, { text }) {
    return state.concat({ text });
  }
}
```

### Using with Redux

```javascript
import { createStore, applyMiddleware } from 'redux';
import { createRootReducer, connectActionSetsToStore } from 'flambeau/redux';
import actionSets from '../actions';
import reducers from '../reducers';

const createStoreWithMiddleware = applyMiddleware(
  // All your favorite redux middleware
)(createStore);

const rootReducer = createRootReducer({ reducers, idToProps: {} });
export const store = createStoreWithMiddleware(rootReducer, initialState);
export const connectedActionSets = connectActionSetsToStore({ actionSets, store });
```

### Introspection

Introspection with the `getConsensus()` function allows actions to request data from reducers whilst keeping them completely decoupled. Action creators have no knowledge of the specifics of reducers’ state.

```javascript
import fetch from 'isomorphic-fetch';

// Simple action
export function invalidateReddit({ reddit }) {}

export function requestPosts({ reddit }) {}

// Action that transforms its requested payload
export function receivePosts({ reddit, json }) {
  return {
    reddit,
    posts: json.data.children.map(child => child.data),
    receivedAt: Date.now()
  };
}

// Helper function that is not exported
function fetchPosts({ reddit }, { currentActionSet }) {
  currentActionSet.requestPosts({ reddit });

  fetch(`http://www.reddit.com/r/${reddit}.json`)
    .then(response => response.json())
    .then(json => currentActionSet.receivePosts({ reddit, json }))
  ;
}

// Methods of introspection that this action set requests that reducers implement.
export const introspection = {
  shouldFetchPosts({ reddit }) {}
}

// Asynchronous action, receiving extra arguments to send other actions or poll reducers for a consensus.
export function fetchPostsIfNeeded({ reddit }, { currentActionSet, getConsensus }) {
  if (getConsensus({
    introspectionID: 'shouldFetchPosts',
    payload: { reddit },
    booleanOr: true
  })) {
    fetchPosts({ reddit }, { currentActionSet });
  };
}
```

## Full Example

See the [async redux demo example](examples/async-redux) for a full example of introspection and the features of Flambeau.
