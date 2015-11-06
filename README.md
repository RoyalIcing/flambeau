# Flambeau
Lightweight Redux enhancements with opinions:

### Declarative action creators
- **No UPPERCASE_CONSTANTS**. Just use an exported function to name the action, and a destructured object to document the payload.
```javascript
export function addTodo({ text }) {} // No constants

export function editTodo({ index, text }) {} // Payload is self-documenting
```
- Namespacing of actions into sets for better organization.
- **Async action support built-in**, with convenient dispatching of other actions.

### Reusable reducers
- **No switch statements** to handle actions, just declare functions following the same structure as the action set.
```javascript
export const TodoListActions = {
  addTodo(state, { text }) {
    return state.concat({ text });
  },

  editTodo(state, { index, text }) {
    let newState = state.slice();
    newState[index] = { text };
    return newState;
  }
}
```
- **Reusable reducers, using props to customize** the response to actions or initial state.
```javascript
// Props are passed in as first argument:
export function getInitialState({ initialItems = [] }) {
  return {
    items: initialItems
  };
}
```
- **Bulk forwarding of action sets** within reducers to allow easy composition of reducers, such as in collections or other hierarchies.

### Reducer state encapsulation
- **Introspection methods to allow encapsulation** of reducers’ internal state. This removes action creators’ knowledge of the store’s structure, allowing greater code reuse.
- Get a **consensus for async actions**, such as whether something needs loading, by polling reducers using their introspection methods.

## Documentation

- [Actions](docs/actions.md)
- [Reducers](docs/reducers.md)
- [Using with Redux](docs/redux.md)

## Installation

`npm install flambeau --save`

## Examples

- See the [async redux demo example](examples/async-redux) for a full example of introspection and the features of Flambeau.
- The great [flux-comparison](https://github.com/voronianski/flux-comparison) project has a [Redux + Flambeau example](https://github.com/voronianski/flux-comparison/tree/master/redux-flambeau).
