# Flambeau
A lightweight flux library with opinions.

Benefits:
- Better structured actions with **namespacing** and **no UPPERCASE_CONSTANTS**.
Just use the exported function’s name to identify the action.
- **Reducers** instead of stores, using pure functions to allow clearer data flow and immutability.
- Allows reducers to be **reused**, using props to customize.
- **No switch statements** to handle actions, just declare a function with the same name as the action’s function.
- **Bulk forwarding of actions** within reducers to allow composition of reducers, such as in collections or other hierarchies.
- **Async action support built-in**.
- Action **introspection methods to allow encapsulation** of reducers’ internal state.
- Get a **consensus for async actions**, such as whether something needs loading or not, by polling reducers using introspection methods. Reduces coupling between reducers and actions, and allows greater code reuse.

## Using Flambeau

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

```javascript
// reducers/TodoListReducer.js

export function getInitialState() {
  return [];
}

export const TodoListActions = {
  addTodo(state, { text }) {
    return state.concat({ text });
  }
}
```

```javascript
// store.js

import Flambeau from 'flambeau';
import reducers from './reducers';
import actions from './actions';


const flambeau = new Flambeau();

// REDUCERS
flambeau.attachReducers(reducers);

// ACTIONS
export const connectedActions = flambeau.registerAndConnectActionSets(actions);

export function subscribe(callback) {
  return flambeau.subscribe(callback);
}

export function get(id) {
  return flambeau.get(id);
}
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

See the [async example](examples/async) for a full example of introspection and the features of Flambeau.
