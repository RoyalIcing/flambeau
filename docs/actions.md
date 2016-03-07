# Actions

## Action Sets

Action sets group multiple action creators into one namespace.

The recommended way to declare an action set is to create a file with the name
of action set, e.g. *TodoListActions.js*. Then declare action creators and
introspection methods, which are detailed below.

## Action Creators

Flambeau’s action creators are declarative. There is no need for
UPPERCASE_CONSTANTS. Simply export a function, with its name identifying the
action creator, and a destructured object (`{ anything, you, like }`) for the
first argument as the payload.

The body of the function can be left empty, if the payload is to be used as-is.
Or if you would like to add other properties or transform the payload in some
way, then return the customized payload you would like.

e.g.
```javascript
export function addTodo({ text }) {} // Payload as-is

export function addTodoWithCurrentDate({ text }) { // Payload transformed
  return {
    dateCreated: new Date(),
    text
  };
}
```

## Async Action Creators

Asynchronous action creators allow operations such as loading or saving to be
encapsulated.
These action creators forward to other actions that reducers can listen to.

To make your action creator asynchronous, simple add a second argument to your action creator with a destructured object
of the following optional properties:
- `currentActionSet`: The action set you are currently declaring within,
allowing you to dispatch sibling actions. Maps action identifiers to each action’s
dispatcher function. e.g. `currentActionSet.otherAction(payload)`
- `allActionSets`: All the action sets, mapping action set identifiers to their dispatcher functions. e.g. `allActionSets.OtherActionSet.someOtherAction(payload)`

```javascript
import fetch from 'isomorphic-fetch';

export function addTodo({ text }) {}
export function addTodosFromURL({ items, URL }) {}

export function importTodosFromURL({ URL }, { currentActionSet, allActionSets }) {
  fetch(URL)
  .then(response => response.json())
  .then(items => currentActionSet.addTodosFromURL({ items, URL }));
}
```

## Introspection

Flambeau allows action creators to query reducers with the concept of
'introspection', which is similar to interfaces or protocols in other
programming languages.

Reducers implement introspection methods, returning results from within its
state. This completely encapsulates the specifics of the state’s structure.
Unlike the use of Redux’s `getState()`, action creators have no knowledge
of the state tree.

Declare introspection methods underneath your exported actions:
```javascript
export const introspection = {
  hasImportedFromURL({ URL }) {},
  hasTodoContainingText({ text }) {}
};
```

Introspection is explained in more detail and with examples in the
[reducers](reducers.md#introspection)
section.

---

**[Actions](actions.md)**
[Reducers](reducers.md)
[Using with Redux](redux.md)
