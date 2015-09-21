# Flambeau
A lightweight, Redux-compatible Flux library with opinions:

### Declarative action creators
- **No UPPERCASE_CONSTANTS**. Just use an exported function to name the action, and a destructured object to document the payload.
```javascript
export function addTodo({ text }) {} // No constants, self-documenting payload
```
- Better organized actions with simple **namespacing** using action sets.
- **Async action support built-in**, with convenient dispatching of other actions.

### Reusable reducers
- **No switch statements** to handle actions, just declare a function with the same name as the action’s function, within an exported object with the same name as the action set.
```javascript
export const TodoListActions = {
  addTodo(state, { text }) {
    return state.concat({ text });
  }
}
```
- **Redux-style reducers** instead of stores, using pure functions to allow clear data flow and immutability.
- **Reusable reducers, using props to customize** the initial state or response to actions.
```javascript
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

## Installation

`npm install flambeau --save`

## Documentation

- [Actions](docs/actions.md)
- [Reducers](docs/reducers.md)
- [Using with Redux](docs/redux.md)

## Example

See the [async redux demo example](examples/async-redux) for a full example of introspection and the features of Flambeau.
