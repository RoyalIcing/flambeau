# Flambeau
A lightweight flux library with opinions:

- Better structured actions with **namespacing** and **no UPPERCASE_CONSTANTS**.
Just use the exported function’s name to identify the action, and a destructured object to document the payload.
- **No switch statements** to handle actions, just declare a function with the same name as the action’s function.
- **Async action support built-in**.
- **Reducers** instead of stores, using pure functions to allow clearer data flow and immutability.
- Allows reducers to be **reused**, using props to customize.
- **Bulk forwarding of actions** within reducers to allow composition of reducers, such as in collections or other hierarchies.
- Action **introspection methods to allow encapsulation** of reducers’ internal state.
- Get a **consensus for async actions**, such as whether something needs loading or not, by polling reducers using introspection methods. This removes coupling between reducers and actions, allowing greater code reuse.

## Actions

```javascript
// actions/TodoListActions.js

export function addTodo({ text }) {
  return { text };
}

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

## Reducer

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

## Using with Redux

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

## Introspection

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

See the [async redux example](examples/async-redux) for a full example of introspection and the features of Flambeau.
