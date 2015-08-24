# Flambeau
A lightweight flux library with opinions.

Benefits:
- Better structured actions with namespacing and no UPPERCASE_CONSTANTS.
Just use the exported function’s name to identify the action.
- Reducers instead of stores, which allows clearer data flow, immutability.
- Allows reducers to be reused, with context to differentiate.
- No switch statements to handle actions, just declare a function with the same name as the action’s function.
- Forwarding actions to child reducers within reducers. Allows resucers to be set up in collections.
- Async action support built-in.

## Using Flambeau

```javascript
// actions/TodoListActions.js
export function addTodo({ text }) {
  return { text };
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
