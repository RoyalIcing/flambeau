# Flambeau
A lightweight Flux (& Redux compatible) library with opinions:

### Declarative action creators
```javascript
export function addTodo({ text }) {} // No constants, self-documenting payload
```
- **No UPPERCASE_CONSTANTS**. Just use an exported function to name the action, and a destructured object to document the payload.
- Better organized actions with simple **namespacing** using action sets.
- **Async action support built-in**, with convenient dispatching of other actions.

### Reusable reducers
- **No switch statements** to handle actions, just declare a function with the same name as the action’s function, inside an exported object with the same name as the action set.
- **Redux-style reducers** instead of stores, using pure functions to allow clear data flow and immutability.
- **Reusable reducers, using props to customize** the initial state or response to actions.
- **Bulk forwarding of action sets** within reducers to allow easy composition of reducers, such as in collections or other hierarchies.

### Reducer encapsulation
- **Introspection methods to allow encapsulation** of reducers’ internal state.
- Get a **consensus for async actions**, such as whether something needs loading, by polling reducers using their introspection methods. This removes coupling between reducers and actions, allowing greater code reuse.

## Installation

`npm install flambeau --save`

## Documentation

- [Actions](docs/actions.md)
- [Reducers](docs/reducers.md)
- [Using with Redux](docs/redux.md)

## Example

See the [async redux demo example](examples/async-redux) for a full example of introspection and the features of Flambeau.
