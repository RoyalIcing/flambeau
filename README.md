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
